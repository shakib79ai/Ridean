import { Global, Injectable, Module, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { supplierCredentials } from '../config/env';
import type { SupplierRow } from '../db/schema';
import { CurbAdapter } from './adapters/curb.adapter';
import { HertzAdapter, PricelineAdapter, SixtAdapter } from './adapters/car-rental.adapters';
import { MozioAdapter } from './adapters/mozio.adapter';
import { GenericHttpAdapter } from './adapters/generic-http.adapter';
import { HttpClient } from './http-client';
import type { AdapterContext, SupplierAdapter, SupplierMode } from './supplier-adapter';

/** Looks up adapters by key and builds the per-supplier context (credentials, mode, HTTP client). */
@Injectable()
export class SupplierRegistry {
  private readonly adapters = new Map<string, SupplierAdapter>();
  private readonly http: HttpClient;

  constructor(
    private readonly config: ConfigService,
    curb: CurbAdapter,
    sixt: SixtAdapter,
    hertz: HertzAdapter,
    priceline: PricelineAdapter,
    mozio: MozioAdapter,
    generic: GenericHttpAdapter,
  ) {
    for (const a of [curb, sixt, hertz, priceline, mozio, generic]) this.register(a);
    this.http = new HttpClient(this.config.get<number>('SUPPLIER_TIMEOUT_MS') ?? 8000);
  }

  /** Register additional adapters at runtime (e.g. from a feature module). */
  register(adapter: SupplierAdapter) {
    this.adapters.set(adapter.key, adapter);
  }

  keys(): string[] {
    return [...this.adapters.keys()];
  }

  get(key: string): SupplierAdapter {
    const a = this.adapters.get(key);
    if (!a) throw new NotFoundException(`No supplier adapter registered for "${key}"`);
    return a;
  }

  context(supplier: SupplierRow, currency: string): AdapterContext {
    return {
      supplier,
      credentials: supplierCredentials(supplier.code),
      mode: (this.config.get<SupplierMode>('SUPPLIER_MODE') ?? 'mock') as SupplierMode,
      http: this.http,
      currency,
    };
  }
}

@Global()
@Module({
  providers: [CurbAdapter, SixtAdapter, HertzAdapter, PricelineAdapter, MozioAdapter, GenericHttpAdapter, SupplierRegistry],
  exports: [SupplierRegistry],
})
export class IntegrationsModule {}
