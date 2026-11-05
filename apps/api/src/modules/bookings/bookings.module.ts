import { Body, Controller, Get, Module, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { CreateBookingRequest, UpdateBookingRequest } from '@ridean/shared';
import { BusinessModule } from '../business/business.module';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { publicBooking } from '../../common/redact';
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
  payWithBusiness: z.boolean().optional(),
  tripPurpose: z.string().max(200).optional(),
  promoCode: z.string().max(40).optional(),
  tip: z.number().int().min(0).max(100_000).optional(),
});
const UpdateBookingSchema = z.object({
  pickupAt: z.string().datetime().optional(),
  flightNumber: z.string().max(12).optional(),
  passengers: z.number().int().min(1).max(20).optional(),
  luggage: z.number().int().min(0).max(20).optional(),
  notes: z.string().max(500).optional(),
  passenger: z.object({ firstName: z.string().min(1).max(80), lastName: z.string().min(1).max(80), email: z.string().email(), phone: z.string().min(5).max(32) }).partial().optional(),
});
const MessageSchema = z.object({ body: z.string().trim().min(1).max(1000) });

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body(new ZodPipe(CreateBookingSchema)) body: CreateBookingRequest) {
    const r = await this.bookings.create(user.id, body);
    return { ...r, booking: publicBooking(r.booking) };
  }

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query('status') status?: string, @Query('page') page?: string) {
    const r = await this.bookings.listForUser(user.id, { status, page: page ? Number(page) : 1 });
    return { ...r, items: r.items.map(publicBooking) };
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return publicBooking(await this.bookings.getForUser(user.id, id));
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(UpdateBookingSchema)) body: UpdateBookingRequest) {
    return this.bookings.update(user.id, id, body).then(publicBooking);
  }

  @Get(':id/status')
  status(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.liveStatus(user.id, id);
  }

  @Get(':id/messages')
  messages(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.messages(user.id, id);
  }

  @Post(':id/messages')
  send(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(MessageSchema)) body: { body: string }) {
    return this.bookings.sendMessage(user.id, id, body.body);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: { reason?: string }) {
    return this.bookings.cancel(user.id, id, body?.reason?.slice(0, 300)).then(publicBooking);
  }
}

@Module({ imports: [QuotesModule, SuppliersModule, PaymentsModule, BusinessModule], controllers: [BookingsController], providers: [BookingsService], exports: [BookingsService] })
export class BookingsModule {}
