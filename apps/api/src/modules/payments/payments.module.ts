import { Body, Controller, Delete, Get, HttpCode, Module, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { WalletSummary } from '@ridean/shared';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { walletTransactions } from '../../db/schema';
import { PaymentsService } from './payments.service';

const SimCardSchema = z.object({ number: z.string().min(12).max(23), expMonth: z.number().int().min(1).max(12), expYear: z.number().int().min(2024).max(2100), makeDefault: z.boolean().optional() });

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentMethodsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('methods')
  list(@CurrentUser() user: AuthUser) {
    return this.payments.listMethods(user.id);
  }

  @Post('setup-intent')
  setupIntent(@CurrentUser() user: AuthUser) {
    return this.payments.setupIntent(user.id);
  }

  @Post('methods/:id/default')
  @HttpCode(204)
  setDefault(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payments.setDefaultMethod(user.id, id);
  }

  @Post('methods/simulated')
  addSimulated(@CurrentUser() user: AuthUser, @Body(new ZodPipe(SimCardSchema)) body: z.infer<typeof SimCardSchema>) {
    return this.payments.addSimulatedCard(user.id, body);
  }

  @Delete('methods/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.payments.detachMethod(user.id, id);
  }
}

const TopUpSchema = z.object({ amount: z.number().int().min(500).max(100_000) });

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly payments: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async summary(@CurrentUser() user: AuthUser): Promise<WalletSummary> {
    const currency = this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD';
    const [bal] = await this.db.select({ v: sql<string>`coalesce(sum(${walletTransactions.amount}),0)` }).from(walletTransactions).where(eq(walletTransactions.userId, user.id));
    const tx = await this.db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.id)).orderBy(desc(walletTransactions.createdAt)).limit(50);
    return { currency, balance: Number(bal?.v ?? 0), transactions: tx.map((t) => ({ id: t.id, amount: t.amount, description: t.description, createdAt: t.createdAt.toISOString() })) };
  }

  /** Creates a PaymentIntent; the wallet is credited by the Stripe webhook (or immediately when simulated). */
  @Post('top-up')
  async topUp(@CurrentUser() user: AuthUser, @Body(new ZodPipe(TopUpSchema)) body: z.infer<typeof TopUpSchema>) {
    const currency = this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD';
    const pi = await this.payments.walletTopUp(user.id, body.amount, currency);
    if (pi.status === 'succeeded') {
      await this.db.insert(walletTransactions).values({ userId: user.id, amount: body.amount, currency, description: 'Wallet top-up', reference: pi.id });
    }
    return { clientSecret: pi.clientSecret, status: pi.status };
  }
}

@Module({ controllers: [PaymentMethodsController, WalletController], providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule {}
