import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './common/auth';
import { validateEnv } from './config/env';
import { DbModule } from './db/db.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AddressesModule } from './modules/account/addresses.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WebhooksModule } from './modules/payments/webhooks.module';
import { QuotesModule } from './modules/quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, envFilePath: ['.env.local', '.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '7d' },
      }),
    }),
    DbModule,
    IntegrationsModule,
    CatalogModule,
    AuthModule,
    AddressesModule,
    QuotesModule,
    PaymentsModule,
    BookingsModule,
    WebhooksModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
