import { BadRequestException, Body, Controller, Get, Module, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { PromoResult, QuoteSearchRequest } from '@ridean/shared';
import { promoDiscount, promoPercent } from '../../common/promo';
import { publicQuote } from '../../common/redact';
import { CurrentUser, Public, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { QuotesService } from './quotes.service';

const Geo = z.object({
  address: z.string().min(2).max(300),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  iata: z.string().length(3).optional(),
  terminal: z.string().max(20).optional(),
  placeId: z.string().max(200).optional(),
});

export const QuoteSearchSchema = z.object({
  service: z.string().min(2).max(40),
  pickup: Geo,
  dropoff: Geo.optional(),
  pickupAt: z.string().datetime({ offset: true }).optional(),
  tripType: z.enum(['one_way', 'return']).optional(),
  returnAt: z.string().datetime({ offset: true }).optional(),
  flightNumber: z.string().max(12).optional(),
  passengers: z.number().int().min(1).max(20).optional(),
  luggage: z.number().int().min(0).max(20).optional(),
  hours: z.number().int().min(1).max(24).optional(),
  rentalPickupAt: z.string().datetime({ offset: true }).optional(),
  rentalReturnAt: z.string().datetime({ offset: true }).optional(),
  returnLocation: Geo.optional(),
  vehicleClass: z.string().max(40).optional(),
  currency: z.string().length(3).optional(),
});

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  /** Public so visitors can see prices before signing in; the quote is linked to the user when logged in. */
  @Public()
  @Post('search')
  async search(@Body(new ZodPipe(QuoteSearchSchema)) body: QuoteSearchRequest, @CurrentUser() user?: AuthUser) {
    const r = await this.quotes.search(body, user?.id);
    return { ...r, quotes: r.quotes.map(publicQuote) };
  }

  /** Checks a promo code against a quote and returns the discounted price (applied for real at booking). */
  @Public()
  @Post(':id/promo')
  async promo(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(z.object({ code: z.string().trim().min(1).max(40) }))) body: { code: string }): Promise<PromoResult> {
    const { quote, supplier } = await this.quotes.get(id);
    if (supplier.paymentFlow === 'supplier_collects') throw new BadRequestException('Promo codes cannot be used when the partner takes payment directly');
    const percentOff = promoPercent(body.code);
    if (!percentOff) throw new BadRequestException("That code isn't valid");
    const discount = promoDiscount(quote.price.customerPrice, quote.price.earnings, percentOff);
    return { code: body.code.toUpperCase(), percentOff, discount, customerPrice: quote.price.customerPrice - discount };
  }

  @Public()
  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return publicQuote((await this.quotes.get(id)).quote);
  }
}

@Module({ imports: [SuppliersModule], controllers: [QuotesController], providers: [QuotesService], exports: [QuotesService] })
export class QuotesModule {}
