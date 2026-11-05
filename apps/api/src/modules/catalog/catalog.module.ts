import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SERVICE_LIST, VEHICLE_CLASSES } from '@ridean/shared';
import { Public } from '../../common/auth';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  @Public()
  @Get('services')
  services() {
    return SERVICE_LIST;
  }

  @Public()
  @Get('vehicle-classes')
  vehicleClasses() {
    return VEHICLE_CLASSES;
  }

  @Public()
  @Get('health')
  health() {
    return { ok: true, time: new Date().toISOString() };
  }
}

@Module({ controllers: [CatalogController] })
export class CatalogModule {}
