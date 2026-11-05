import { Body, Controller, Delete, Get, HttpCode, Module, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { addresses } from '../../db/schema';

const AddressSchema = z.object({ label: z.string().min(1).max(40), address: z.string().min(3).max(300), lat: z.number().optional(), lng: z.number().optional() });

@ApiTags('account')
@ApiBearerAuth()
@Controller('me/addresses')
export class AddressesController {
  constructor(@InjectDb() private readonly db: Db) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.createdAt));
  }

  @Post()
  async add(@CurrentUser() user: AuthUser, @Body(new ZodPipe(AddressSchema)) body: z.infer<typeof AddressSchema>) {
    const [row] = await this.db.insert(addresses).values({ ...body, userId: user.id }).returning();
    return row;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  }
}

@Module({ controllers: [AddressesController] })
export class AddressesModule {}
