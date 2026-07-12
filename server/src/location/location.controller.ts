import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { QueryStreetsDto } from './dto/query-streets.dto';
import { QueryWardsDto } from './dto/query-wards.dto';
import {
  HCMC_CITY_NAME,
  HCMC_COUNTRY_CODE,
  HCMC_PROVINCE_CODE,
  HCMC_PROVINCE_NAME,
} from './location.constants';
import { LocationService, type LocationOption } from './location.service';

@Controller('locations')
@UseGuards(AuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('scope')
  getScope() {
    return {
      city: HCMC_CITY_NAME,
      province: HCMC_PROVINCE_NAME,
      country: HCMC_COUNTRY_CODE,
      province_code: HCMC_PROVINCE_CODE,
    };
  }

  @Get('districts')
  getDistricts(): Promise<LocationOption[]> {
    return this.locationService.getDistricts();
  }

  @Get('wards')
  getWards(@Query() query: QueryWardsDto): Promise<LocationOption[]> {
    return this.locationService.getWards(query.district_code);
  }

  @Get('streets')
  getStreets(@Query() query: QueryStreetsDto): Promise<LocationOption[]> {
    return this.locationService.getStreets(
      query.ward,
      query.district,
      query.search,
    );
  }
}
