import { BadRequestException, Controller, Headers, HttpCode, Logger, Module, Post, Req, type RawBodyRequest } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { Public } from '../../common/auth';
import { InjectDb, type Db } from '../../db/db.module';
import { payments, walletTransactions, webhookEvents } from '../../db/schema';
import { BookingsModule } from '../bookings/bookings.module';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentsModule } from './payments.module';
import { PaymentsService } from './payments.service';

/**
 * Stripe webhook. Configure in the Stripe dashboard → Developers → Webhooks:
 *   URL: https://api.your-domain.com/webhooks/stripe
 *   Events: payment_intent.amount_capturable_updated, payment_intent.succeeded, payment_intent.payment_failed
 */
@ApiExcludeController()
@Controller('webhooks')
export class WebhooksController {
  private readonly log = new Logger(WebhooksController.name);

  constructor(
    private readonly paymentsSvc: PaymentsService,
    private readonly bookings: BookingsService,
    @InjectDb() private readonly db: Db,
  ) {}

  @Public()
  @Post('stripe')
  @HttpCode(200)
  async stripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    if (!req.rawBody || !signature) throw new BadRequestException('Missing signature');
    let event: Stripe.Event;
    try {
      event = this.paymentsSvc.constructEvent(req.rawBody, signature);
    } catch (e) {
      throw new BadRequestException(`Invalid signature: ${(e as Error).message}`);
    }

    // Idempotency: Stripe may deliver the same event more than once
    const inserted = await this.db.insert(webhookEvents).values({ id: event.id, provider: 'stripe', type: event.type }).onConflictDoNothing().returning();
    if (!inserted.length) return { received: true, duplicate: true };

    const pi = event.data.object as Stripe.PaymentIntent;
    const kind = pi.metadata?.kind;
    try {
      if (event.type === 'payment_intent.amount_capturable_updated' && kind === 'booking') {
        await this.bookings.onPaymentAuthorised(pi.metadata.bookingId);
      } else if (event.type === 'payment_intent.succeeded' && kind === 'wallet_topup') {
        await this.db.insert(walletTransactions).values({ userId: pi.metadata.userId, amount: pi.amount_received, currency: pi.currency.toUpperCase(), description: 'Wallet top-up', reference: pi.id });
        await this.db.insert(payments).values({ userId: pi.metadata.userId, provider: 'stripe', providerRef: pi.id, kind: 'wallet_topup', amount: pi.amount_received, currency: pi.currency.toUpperCase(), status: 'succeeded' });
      } else if (event.type === 'payment_intent.payment_failed' && kind === 'booking') {
        await this.bookings.markFailed(pi.metadata.bookingId);
      }
    } catch (e) {
      this.log.error(`Webhook ${event.type} failed: ${(e as Error).message}`);
      // Forget the event so Stripe's retry is processed again
      await this.db.delete(webhookEvents).where(eq(webhookEvents.id, event.id));
      throw e;
    }
    return { received: true };
  }
}

@Module({ imports: [PaymentsModule, BookingsModule], controllers: [WebhooksController] })
export class WebhooksModule {}
