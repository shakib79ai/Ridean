import { Global, Injectable, Module, ServiceUnavailableException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PlatformSettings } from '@ridean/shared';
import { InjectDb, type Db } from '../../db/db.module';
import { platformSettings } from '../../db/schema';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  general: { platformName: 'Ridean', company: 'Best My Flight Inc.', supportEmail: 'support@ridean.com', market: 'New York City, NY' },
  supplierDefaults: { inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 12 },
  bookingsPaused: false,
};

/** Platform-wide settings (one row). Cached briefly because quote search and booking read it on every call. */
@Injectable()
export class PlatformService {
  private cache?: { at: number; value: PlatformSettings };
  constructor(@InjectDb() private readonly db: Db) {}

  async get(): Promise<PlatformSettings> {
    if (this.cache && Date.now() - this.cache.at < 5_000) return this.cache.value;
    const [row] = await this.db.select().from(platformSettings).where(eq(platformSettings.id, 'platform'));
    const v = (row?.value ?? {}) as Partial<PlatformSettings>;
    const value: PlatformSettings = {
      general: { ...DEFAULT_PLATFORM_SETTINGS.general, ...(v.general ?? {}) },
      supplierDefaults: { ...DEFAULT_PLATFORM_SETTINGS.supplierDefaults, ...(v.supplierDefaults ?? {}) },
      bookingsPaused: v.bookingsPaused ?? false,
      updatedAt: row?.updatedAt.toISOString(),
    };
    this.cache = { at: Date.now(), value };
    return value;
  }

  async update(patch: Partial<Omit<PlatformSettings, 'updatedAt'>>, userId: string): Promise<PlatformSettings> {
    const cur = await this.get();
    const next = {
      general: { ...cur.general, ...(patch.general ?? {}) },
      supplierDefaults: { ...cur.supplierDefaults, ...(patch.supplierDefaults ?? {}) },
      bookingsPaused: patch.bookingsPaused ?? cur.bookingsPaused,
    };
    await this.db
      .insert(platformSettings)
      .values({ id: 'platform', value: next, updatedBy: userId, updatedAt: new Date() })
      .onConflictDoUpdate({ target: platformSettings.id, set: { value: next, updatedBy: userId, updatedAt: new Date() } });
    this.cache = undefined;
    return this.get();
  }

  /** Throws when operations have paused new bookings platform-wide. */
  async assertTakingBookings() {
    if ((await this.get()).bookingsPaused) {
      throw new ServiceUnavailableException('Ridean is not taking new bookings right now. Existing trips are not affected — please try again later.');
    }
  }
}

@Global()
@Module({ providers: [PlatformService], exports: [PlatformService] })
export class PlatformModule {}
