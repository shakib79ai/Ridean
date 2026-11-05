import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Module, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { DEFAULT_USER_SETTINGS, type UserSettings } from '@ridean/shared';
import { CurrentUser, Public, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { addresses, bookings, contactMessages, users, walletTransactions } from '../../db/schema';
import { toUser } from '../auth/auth.module';

const SettingsSchema = z
  .object({
    notifications: z.object({ tripUpdates: z.boolean(), flightAlerts: z.boolean(), offers: z.boolean() }).partial(),
    ride: z.object({ quietRide: z.boolean(), receiptsByEmail: z.boolean(), shareStatus: z.boolean() }).partial(),
    privacy: z.object({ shareLocation: z.boolean(), personalisedOffers: z.boolean(), analytics: z.boolean() }).partial(),
    preferences: z.object({ language: z.string().max(10), currency: z.string().length(3), appearance: z.enum(['dark', 'light', 'system']) }).partial(),
  })
  .partial();
const PasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8, 'Password must be at least 8 characters').max(200) });
const DeleteSchema = z.object({ password: z.string().min(1) });
const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  topic: z.string().trim().min(1).max(60),
  message: z.string().trim().min(5).max(4000),
});

/** Merge stored settings over defaults so new keys always have a value. */
export function readSettings(raw: Record<string, unknown> | null | undefined): UserSettings {
  const s = (raw ?? {}) as Partial<UserSettings>;
  return {
    notifications: { ...DEFAULT_USER_SETTINGS.notifications, ...s.notifications },
    ride: { ...DEFAULT_USER_SETTINGS.ride, ...s.ride },
    privacy: { ...DEFAULT_USER_SETTINGS.privacy, ...s.privacy },
    preferences: { ...DEFAULT_USER_SETTINGS.preferences, ...s.preferences },
    defaultPaymentMethod: s.defaultPaymentMethod,
  };
}

const OPEN_STATUSES = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned', 'in_progress'];

@Injectable()
export class AccountService {
  constructor(@InjectDb() private readonly db: Db) {}

  async settings(userId: string): Promise<UserSettings> {
    const [u] = await this.db.select({ settings: users.settings }).from(users).where(eq(users.id, userId));
    return readSettings(u?.settings);
  }

  async updateSettings(userId: string, patch: z.infer<typeof SettingsSchema>): Promise<UserSettings> {
    const [u] = await this.db.select({ settings: users.settings }).from(users).where(eq(users.id, userId));
    const cur = readSettings(u?.settings);
    const next: UserSettings = {
      ...cur,
      notifications: { ...cur.notifications, ...patch.notifications },
      ride: { ...cur.ride, ...patch.ride },
      privacy: { ...cur.privacy, ...patch.privacy },
      preferences: { ...cur.preferences, ...patch.preferences },
    };
    await this.db.update(users).set({ settings: { ...(u?.settings ?? {}), ...next } }).where(eq(users.id, userId));
    return next;
  }

  async changePassword(userId: string, input: z.infer<typeof PasswordSchema>) {
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!u || !(await bcrypt.compare(input.currentPassword, u.passwordHash))) throw new UnauthorizedException('Your current password is incorrect');
    await this.db.update(users).set({ passwordHash: await bcrypt.hash(input.newPassword, 12) }).where(eq(users.id, userId));
  }

  /** Everything we hold about the user, as JSON (data portability). */
  async export(userId: string) {
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    const [addr, trips, wallet] = await Promise.all([
      this.db.select().from(addresses).where(eq(addresses.userId, userId)),
      this.db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt)),
      this.db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      profile: toUser(u),
      settings: readSettings(u.settings),
      savedAddresses: addr.map((a) => ({ label: a.label, address: a.address, createdAt: a.createdAt })),
      trips: trips.map((b) => ({ reference: b.reference, service: b.service, status: b.status, pickup: b.pickup.address, dropoff: b.dropoff?.address, pickupAt: b.pickupAt, passenger: b.passenger, total: b.customerPrice / 100, currency: b.currency, createdAt: b.createdAt })),
      wallet: wallet.map((t) => ({ amount: t.amount / 100, currency: t.currency, description: t.description, createdAt: t.createdAt })),
    };
  }

  /**
   * Closes the account: personal data is removed, while booking and payment records are kept
   * (anonymised) because they are financial records.
   */
  async delete(userId: string, password: string) {
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) throw new UnauthorizedException('Your password is incorrect');
    const open = await this.db.select({ id: bookings.id }).from(bookings).where(and(eq(bookings.userId, userId), inArray(bookings.status, OPEN_STATUSES)));
    if (open.length) throw new BadRequestException('Cancel or complete your upcoming trips before deleting your account');
    await this.db.delete(addresses).where(eq(addresses.userId, userId));
    await this.db
      .update(users)
      .set({ email: `deleted+${u.id}@ridean.invalid`, firstName: 'Deleted', lastName: 'user', phone: null, passwordHash: await bcrypt.hash(crypto.randomUUID(), 4), settings: {}, deletedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async contact(userId: string | undefined, input: z.infer<typeof ContactSchema>) {
    await this.db.insert(contactMessages).values({ ...input, userId });
    return { ok: true as const };
  }
}

@ApiTags('account')
@Controller()
export class AccountController {
  constructor(private readonly svc: AccountService) {}

  @ApiBearerAuth()
  @Get('me/settings')
  settings(@CurrentUser() user: AuthUser) {
    return this.svc.settings(user.id);
  }

  @ApiBearerAuth()
  @Patch('me/settings')
  update(@CurrentUser() user: AuthUser, @Body(new ZodPipe(SettingsSchema)) body: z.infer<typeof SettingsSchema>) {
    return this.svc.updateSettings(user.id, body);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('me/password')
  @HttpCode(204)
  password(@CurrentUser() user: AuthUser, @Body(new ZodPipe(PasswordSchema)) body: z.infer<typeof PasswordSchema>) {
    return this.svc.changePassword(user.id, body);
  }

  @ApiBearerAuth()
  @Get('me/export')
  export(@CurrentUser() user: AuthUser) {
    return this.svc.export(user.id);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('me/delete')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Body(new ZodPipe(DeleteSchema)) body: z.infer<typeof DeleteSchema>) {
    return this.svc.delete(user.id, body.password);
  }

  /** Public contact form; linked to the account when signed in. */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('contact')
  contact(@Body(new ZodPipe(ContactSchema)) body: z.infer<typeof ContactSchema>, @CurrentUser() user?: AuthUser) {
    return this.svc.contact(user?.id, body);
  }
}

@Module({ controllers: [AccountController], providers: [AccountService], exports: [AccountService] })
export class AccountModule {}
