import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { InjectDb, type Db } from '../../db/db.module';
import { users } from '../../db/schema';

export interface IntentResult {
  id: string;
  clientSecret?: string;
  status: 'requires_payment_method' | 'requires_action' | 'requires_capture' | 'succeeded' | 'processing' | 'canceled' | string;
}

/**
 * Thin wrapper around Stripe. In PAYMENTS_MODE=simulated (local development only) every call
 * succeeds immediately so the booking flow can be exercised without Stripe keys.
 */
@Injectable()
export class PaymentsService {
  private readonly log = new Logger(PaymentsService.name);
  readonly stripe?: Stripe;
  readonly simulated: boolean;

  constructor(
    private readonly config: ConfigService,
    @InjectDb() private readonly db: Db,
  ) {
    this.simulated = this.config.get('PAYMENTS_MODE') !== 'stripe';
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!this.simulated && key) this.stripe = new Stripe(key);
    if (this.simulated) this.log.warn('PAYMENTS_MODE=simulated — payments are NOT charged. Development only.');
  }

  async ensureCustomer(userId: string): Promise<string | undefined> {
    if (!this.stripe) return undefined;
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!u) throw new BadRequestException('User not found');
    if (u.stripeCustomerId) return u.stripeCustomerId;
    const c = await this.stripe.customers.create({ email: u.email, name: `${u.firstName} ${u.lastName}`, phone: u.phone ?? undefined, metadata: { userId } });
    await this.db.update(users).set({ stripeCustomerId: c.id }).where(eq(users.id, userId));
    return c.id;
  }

  /**
   * Authorises (does not capture) the customer's card. The booking service captures only after
   * the supplier confirms, and cancels the authorisation if the supplier booking fails.
   */
  async authorise(input: { userId: string; amount: number; currency: string; bookingId: string; reference: string; paymentMethodId?: string }): Promise<IntentResult> {
    if (!this.stripe) return { id: `sim_pi_${input.bookingId}`, status: 'requires_capture' };
    const customer = await this.ensureCustomer(input.userId);
    const pi = await this.stripe.paymentIntents.create(
      {
        amount: input.amount,
        currency: input.currency.toLowerCase(),
        customer,
        capture_method: 'manual',
        automatic_payment_methods: input.paymentMethodId ? undefined : { enabled: true },
        payment_method: input.paymentMethodId,
        confirm: !!input.paymentMethodId,
        off_session: input.paymentMethodId ? false : undefined,
        description: `Ridean booking ${input.reference}`,
        metadata: { kind: 'booking', bookingId: input.bookingId, reference: input.reference },
      },
      { idempotencyKey: `booking-${input.bookingId}` },
    );
    return { id: pi.id, clientSecret: pi.client_secret ?? undefined, status: pi.status };
  }

  async capture(paymentIntentId: string, amount?: number) {
    if (!this.stripe || paymentIntentId.startsWith('sim_')) return;
    await this.stripe.paymentIntents.capture(paymentIntentId, amount ? { amount_to_capture: amount } : undefined);
  }

  async cancelAuthorisation(paymentIntentId: string) {
    if (!this.stripe || paymentIntentId.startsWith('sim_')) return;
    await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async refund(paymentIntentId: string, amount?: number) {
    if (!this.stripe || paymentIntentId.startsWith('sim_')) return;
    await this.stripe.refunds.create({ payment_intent: paymentIntentId, amount });
  }

  async walletTopUp(userId: string, amount: number, currency: string): Promise<IntentResult> {
    if (!this.stripe) return { id: `sim_topup_${Date.now()}`, status: 'succeeded' };
    const customer = await this.ensureCustomer(userId);
    const pi = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer,
      automatic_payment_methods: { enabled: true },
      description: 'Ridean wallet top-up',
      metadata: { kind: 'wallet_topup', userId },
    });
    return { id: pi.id, clientSecret: pi.client_secret ?? undefined, status: pi.status };
  }

  async setupIntent(userId: string) {
    if (!this.stripe) return { clientSecret: 'sim_seti_secret' };
    const customer = await this.ensureCustomer(userId);
    const si = await this.stripe.setupIntents.create({ customer, automatic_payment_methods: { enabled: true }, usage: 'off_session' });
    return { clientSecret: si.client_secret! };
  }

  async listMethods(userId: string) {
    if (!this.stripe) return [];
    const customer = await this.ensureCustomer(userId);
    const list = await this.stripe.paymentMethods.list({ customer: customer!, type: 'card' });
    return list.data.map((m) => ({ id: m.id, brand: m.card?.brand ?? 'card', last4: m.card?.last4 ?? '••••', expMonth: m.card?.exp_month ?? 0, expYear: m.card?.exp_year ?? 0 }));
  }

  async detachMethod(userId: string, id: string) {
    if (!this.stripe) return;
    const customer = await this.ensureCustomer(userId);
    const pm = await this.stripe.paymentMethods.retrieve(id);
    if (pm.customer !== customer) throw new BadRequestException('Card not found');
    await this.stripe.paymentMethods.detach(id);
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not set');
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
