import { Module } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';
import { SuppliersService } from './suppliers.service';

@Module({ providers: [SuppliersService, LedgerService], exports: [SuppliersService, LedgerService] })
export class SuppliersModule {}
