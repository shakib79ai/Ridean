import { Body, ConflictException, Controller, Get, Injectable, Module, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AuthResponse, User } from '@ridean/shared';
import { CurrentUser, Public, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { users, type UserRow } from '../../db/schema';

const RegisterSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(32).optional(),
});
const LoginSchema = z.object({ email: z.string().email().transform((e) => e.toLowerCase().trim()), password: z.string().min(1) });
const UpdateMeSchema = z.object({ firstName: z.string().min(1).max(80).optional(), lastName: z.string().min(1).max(80).optional(), phone: z.string().max(32).optional() });

export function toUser(u: UserRow): User {
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? undefined, role: u.role, createdAt: u.createdAt.toISOString() };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly jwt: JwtService,
  ) {}

  async register(input: z.infer<typeof RegisterSchema>): Promise<AuthResponse> {
    const exists = await this.db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
    if (exists.length) throw new ConflictException('An account with this email already exists');
    const [u] = await this.db
      .insert(users)
      .values({ email: input.email, passwordHash: await bcrypt.hash(input.password, 12), firstName: input.firstName, lastName: input.lastName, phone: input.phone })
      .returning();
    return this.issue(u);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const [u] = await this.db.select().from(users).where(eq(users.email, email));
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) throw new UnauthorizedException('Email or password is incorrect');
    return this.issue(u);
  }

  async me(id: string): Promise<User> {
    const [u] = await this.db.select().from(users).where(eq(users.id, id));
    if (!u) throw new UnauthorizedException();
    return toUser(u);
  }

  async updateMe(id: string, input: z.infer<typeof UpdateMeSchema>): Promise<User> {
    const [u] = await this.db.update(users).set(input).where(eq(users.id, id)).returning();
    return toUser(u);
  }

  private async issue(u: UserRow): Promise<AuthResponse> {
    const accessToken = await this.jwt.signAsync({ sub: u.id, email: u.email, role: u.role });
    return { accessToken, user: toUser(u) };
  }
}

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('auth/register')
  register(@Body(new ZodPipe(RegisterSchema)) body: z.infer<typeof RegisterSchema>) {
    return this.auth.register(body);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('auth/login')
  login(@Body(new ZodPipe(LoginSchema)) body: z.infer<typeof LoginSchema>) {
    return this.auth.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  @ApiBearerAuth()
  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body(new ZodPipe(UpdateMeSchema)) body: z.infer<typeof UpdateMeSchema>) {
    return this.auth.updateMe(user.id, body);
  }
}

@Module({ controllers: [AuthController], providers: [AuthService], exports: [AuthService] })
export class AuthModule {}
