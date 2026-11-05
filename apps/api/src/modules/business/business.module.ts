import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Injectable, Module, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { BusinessAccount, BusinessPolicy } from '@ridean/shared';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { bookings, businessAccounts, businessMembers, users } from '../../db/schema';

const DEFAULT_POLICY: BusinessPolicy = { requirePurpose: true, businessClassOnly: false, approvalOver: 0 };
const SPEND_STATUSES = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];
/** Vehicle classes allowed when the policy restricts travel to business class and above. */
export const BUSINESS_CLASSES = ['business', 'black'];

const CreateSchema = z.object({ name: z.string().min(2).max(120), monthlyBudget: z.number().int().min(0).optional(), billingEmail: z.string().email().optional() });
const UpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  monthlyBudget: z.number().int().min(0).optional(),
  billingEmail: z.string().email().optional(),
  policy: z.object({ requirePurpose: z.boolean().optional(), businessClassOnly: z.boolean().optional(), approvalOver: z.number().int().min(0).optional() }).optional(),
});
const InviteSchema = z.object({ email: z.string().email().transform((e) => e.toLowerCase().trim()), name: z.string().max(120).optional(), role: z.enum(['admin', 'member']).optional() });

export interface Membership {
  accountId: string;
  role: 'admin' | 'member';
  policy: BusinessPolicy;
}

@Injectable()
export class BusinessService {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly config: ConfigService,
  ) {}

  /** Active membership for a user; invited members are activated on first lookup when their email matches. */
  async membership(userId: string): Promise<Membership | null> {
    const [u] = await this.db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    if (!u) return null;
    const [m] = await this.db
      .select({ m: businessMembers, a: businessAccounts })
      .from(businessMembers)
      .innerJoin(businessAccounts, eq(businessMembers.accountId, businessAccounts.id))
      .where(sql`${businessMembers.userId} = ${userId} OR ${businessMembers.email} = ${u.email}`)
      .limit(1);
    if (!m) return null;
    if (m.m.status !== 'active' || !m.m.userId) {
      await this.db.update(businessMembers).set({ status: 'active', userId }).where(eq(businessMembers.id, m.m.id));
    }
    return { accountId: m.a.id, role: m.m.role, policy: { ...DEFAULT_POLICY, ...(m.a.policy as Partial<BusinessPolicy>) } };
  }

  async get(userId: string): Promise<BusinessAccount | null> {
    const mem = await this.membership(userId);
    if (!mem) return null;
    return this.view(mem.accountId, mem.role);
  }

  async create(userId: string, input: z.infer<typeof CreateSchema>): Promise<BusinessAccount> {
    if (await this.membership(userId)) throw new BadRequestException('You already belong to a business account');
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    const [a] = await this.db.insert(businessAccounts).values({ name: input.name, ownerId: userId, monthlyBudget: input.monthlyBudget ?? 0, billingEmail: input.billingEmail ?? u.email, policy: { ...DEFAULT_POLICY } }).returning();
    await this.db.insert(businessMembers).values({ accountId: a.id, userId, email: u.email, name: `${u.firstName} ${u.lastName}`, role: 'admin', status: 'active' });
    return this.view(a.id, 'admin');
  }

  async update(userId: string, input: z.infer<typeof UpdateSchema>): Promise<BusinessAccount> {
    const mem = await this.requireAdmin(userId);
    const [a] = await this.db.select().from(businessAccounts).where(eq(businessAccounts.id, mem.accountId));
    await this.db
      .update(businessAccounts)
      .set({
        name: input.name ?? a.name,
        monthlyBudget: input.monthlyBudget ?? a.monthlyBudget,
        billingEmail: input.billingEmail ?? a.billingEmail,
        policy: input.policy ? { ...DEFAULT_POLICY, ...(a.policy as object), ...input.policy } : a.policy,
      })
      .where(eq(businessAccounts.id, a.id));
    return this.view(a.id, 'admin');
  }

  async invite(userId: string, input: z.infer<typeof InviteSchema>): Promise<BusinessAccount> {
    const mem = await this.requireAdmin(userId);
    const [existing] = await this.db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.email, input.email));
    await this.db
      .insert(businessMembers)
      .values({ accountId: mem.accountId, email: input.email, name: input.name ?? (existing ? `${existing.firstName} ${existing.lastName}` : undefined), role: input.role ?? 'member', status: 'invited', userId: existing?.id })
      .onConflictDoNothing();
    return this.view(mem.accountId, 'admin');
  }

  async remove(userId: string, memberId: string): Promise<BusinessAccount> {
    const mem = await this.requireAdmin(userId);
    const [m] = await this.db.select().from(businessMembers).where(and(eq(businessMembers.id, memberId), eq(businessMembers.accountId, mem.accountId)));
    if (!m) throw new NotFoundException('Member not found');
    if (m.userId === userId) throw new BadRequestException('You cannot remove yourself');
    await this.db.delete(businessMembers).where(eq(businessMembers.id, memberId));
    return this.view(mem.accountId, 'admin');
  }

  /** Spend this calendar month (UTC) for the account, used for the budget bar and policy checks. */
  async monthSpend(accountId: string) {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const rows = await this.db
      .select({ userId: bookings.userId, n: sql<string>`count(*)`, total: sql<string>`coalesce(sum(${bookings.customerPrice}),0)` })
      .from(bookings)
      .where(and(eq(bookings.businessAccountId, accountId), inArray(bookings.status, SPEND_STATUSES), sql`${bookings.createdAt} >= ${start}`))
      .groupBy(bookings.userId);
    return new Map(rows.map((r) => [r.userId, { trips: Number(r.n), spend: Number(r.total) }]));
  }

  private async requireAdmin(userId: string) {
    const mem = await this.membership(userId);
    if (!mem) throw new NotFoundException('No business account');
    if (mem.role !== 'admin') throw new ForbiddenException('Only account admins can change this');
    return mem;
  }

  private async view(accountId: string, role: 'admin' | 'member'): Promise<BusinessAccount> {
    const [a] = await this.db.select().from(businessAccounts).where(eq(businessAccounts.id, accountId));
    const members = await this.db.select().from(businessMembers).where(eq(businessMembers.accountId, accountId));
    const spend = await this.monthSpend(accountId);
    let trips = 0;
    let total = 0;
    for (const v of spend.values()) {
      trips += v.trips;
      total += v.spend;
    }
    return {
      id: a.id,
      name: a.name,
      role,
      monthlyBudget: a.monthlyBudget,
      spendThisMonth: total,
      tripsThisMonth: trips,
      currency: this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD',
      policy: { ...DEFAULT_POLICY, ...(a.policy as Partial<BusinessPolicy>) },
      billingEmail: a.billingEmail ?? undefined,
      members: members
        .sort((x, y) => (x.role === y.role ? x.createdAt.getTime() - y.createdAt.getTime() : x.role === 'admin' ? -1 : 1))
        .map((m) => ({ id: m.id, name: m.name ?? undefined, email: m.email, role: m.role, status: m.status, tripsThisMonth: (m.userId && spend.get(m.userId)?.trips) || 0, spendThisMonth: (m.userId && spend.get(m.userId)?.spend) || 0 })),
    };
  }
}

@ApiTags('business')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(private readonly svc: BusinessService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.svc.get(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body(new ZodPipe(CreateSchema)) body: z.infer<typeof CreateSchema>) {
    return this.svc.create(user.id, body);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body(new ZodPipe(UpdateSchema)) body: z.infer<typeof UpdateSchema>) {
    return this.svc.update(user.id, body);
  }

  @Post('members')
  invite(@CurrentUser() user: AuthUser, @Body(new ZodPipe(InviteSchema)) body: z.infer<typeof InviteSchema>) {
    return this.svc.invite(user.id, body);
  }

  @Delete('members/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(user.id, id);
  }
}

@Module({ controllers: [BusinessController], providers: [BusinessService], exports: [BusinessService] })
export class BusinessModule {}
