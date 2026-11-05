import { Body, Controller, Get, Module, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { CreateBookingRequest } from '@ridean/shared';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { PaymentsModule } from '../payments/payments.module';
import { QuotesModule } from '../quotes/quotes.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BookingsService } from './bookings.service';

const CreateBookingSchema = z.object({
  quoteId: z.string().uuid(),
  passenger: z.object({ firstName: z.string().min(1).max(80), lastName: z.string().min(1).max(80), email: z.string().email(), phone: z.string().min(5).max(32) }),
  flightNumber: z.string().max(12).optional(),
  notes: z.string().max(500).optional(),
  paymentMethodId: z.string().max(100).optional(),
  payWithWallet: z.boolean().optional(),
});

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body(new ZodPipe(CreateBookingSchema)) body: CreateBookingRequest) {
    return this.bookings.create(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('status') status?: string, @Query('page') page?: string) {
    return this.bookings.listForUser(user.id, { status, page: page ? Number(page) : 1 });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.getForUser(user.id, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: { reason?: string }) {
    return this.bookings.cancel(user.id, id, body?.reason?.slice(0, 300));
  }
}

@Module({ imports: [QuotesModule, SuppliersModule, PaymentsModule], controllers: [BookingsController], providers: [BookingsService], exports: [BookingsService] })
export class BookingsModule {}
