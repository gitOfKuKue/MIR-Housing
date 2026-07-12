import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PROPERTY_IMAGE_MAX_UPLOAD_COUNT } from './properties.constants';
import { AccessToken } from '../auth/decorators/access-token.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../auth/enums/staff-role.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreatePropertyUtilityBillDto } from './dto/create-property-utility-bill.dto';
import { BulkCreatePropertiesDto } from './dto/bulk-create-properties.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { QueryPropertyUtilityBillsDto } from './dto/query-property-utility-bills.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UpdatePropertyUtilityBillDto } from './dto/update-property-utility-bill.dto';
import { Property } from './entities/property.entity';
import { PropertyUtilityBill } from './entities/property-utility-bill.entity';
import { PropertyWithImages } from './entities/property-with-images.entity';
import { PropertiesService } from './properties.service';
import type { PaginatedResponse } from '../common/pagination/paginated-response.interface';
import type { DeletePropertyResponse } from './interfaces/delete-property-response.interface';
import type { BulkCreatePropertiesResponse } from './interfaces/bulk-create-properties-response.interface';
import type {
  ListPropertyImagesResponse,
  UploadPropertyImagesResponse,
} from './interfaces/property-image-response.interface';
import type {
  DeletePropertyUtilityBillResponse,
  ListPropertyUtilityBillsResponse,
} from './interfaces/property-utility-bill-response.interface';

@Controller('properties')
@UseGuards(AuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(
    @Query() query: QueryPropertiesDto,
    @AccessToken() accessToken: string,
  ): Promise<PaginatedResponse<PropertyWithImages>> {
    return this.propertiesService.findAll(query, accessToken);
  }

  @Get('rent-bounds')
  getRentBounds(
    @AccessToken() accessToken: string,
  ): Promise<{ max_rent: number | null }> {
    return this.propertiesService.getRentBounds(accessToken);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(StaffRole.Admin, StaffRole.Sale)
  createBulk(
    @Body() dto: BulkCreatePropertiesDto,
    @CurrentUser() user: AuthUser,
    @AccessToken() accessToken: string,
  ): Promise<BulkCreatePropertiesResponse> {
    return this.propertiesService.createBulk(
      dto.properties,
      user.id,
      accessToken,
    );
  }

  @Get(':id/images')
  listImages(
    @Param('id', ParseUUIDPipe) id: string,
    @AccessToken() accessToken: string,
  ): Promise<ListPropertyImagesResponse> {
    return this.propertiesService.listImages(id, accessToken);
  }

  @Post(':id/images')
  @UseGuards(RolesGuard)
  @Roles(StaffRole.Admin, StaffRole.Sale)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: PROPERTY_IMAGE_MAX_UPLOAD_COUNT },
      { name: 'files', maxCount: PROPERTY_IMAGE_MAX_UPLOAD_COUNT },
    ]),
  )
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles()
    uploadedFiles: {
      file?: Express.Multer.File[];
      files?: Express.Multer.File[];
    },
    @AccessToken() accessToken: string,
    @Body('sort_order') sortOrder?: string,
  ): Promise<UploadPropertyImagesResponse> {
    const files = [
      ...(uploadedFiles.file ?? []),
      ...(uploadedFiles.files ?? []),
    ];
    const parsedSortOrder = sortOrder ? Number(sortOrder) : 0;

    return this.propertiesService.uploadImages(
      id,
      files,
      accessToken,
      Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
    );
  }

  @Get(':id/utility-bills')
  listUtilityBills(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryPropertyUtilityBillsDto,
    @AccessToken() accessToken: string,
  ): Promise<ListPropertyUtilityBillsResponse> {
    return this.propertiesService.listUtilityBills(id, query, accessToken);
  }

  @Post(':id/utility-bills')
  @UseGuards(RolesGuard)
  @Roles(StaffRole.Admin, StaffRole.Sale)
  createUtilityBill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePropertyUtilityBillDto,
    @CurrentUser() user: AuthUser,
    @AccessToken() accessToken: string,
  ): Promise<PropertyUtilityBill> {
    return this.propertiesService.createUtilityBill(
      id,
      dto,
      user.id,
      accessToken,
    );
  }

  @Patch(':id/utility-bills/:billId')
  updateUtilityBill(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('billId', ParseUUIDPipe) billId: string,
    @Body() dto: UpdatePropertyUtilityBillDto,
    @AccessToken() accessToken: string,
  ): Promise<PropertyUtilityBill> {
    return this.propertiesService.updateUtilityBill(id, billId, dto, accessToken);
  }

  @Delete(':id/utility-bills/:billId')
  removeUtilityBill(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('billId', ParseUUIDPipe) billId: string,
    @AccessToken() accessToken: string,
  ): Promise<DeletePropertyUtilityBillResponse> {
    return this.propertiesService.removeUtilityBill(id, billId, accessToken);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @AccessToken() accessToken: string,
  ): Promise<PropertyWithImages> {
    return this.propertiesService.findOne(id, accessToken);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(StaffRole.Admin, StaffRole.Sale)
  create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: AuthUser,
    @AccessToken() accessToken: string,
  ): Promise<Property> {
    return this.propertiesService.create(dto, user.id, accessToken);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @AccessToken() accessToken: string,
  ): Promise<Property> {
    return this.propertiesService.update(id, dto, accessToken);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(StaffRole.Admin, StaffRole.Sale)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AccessToken() accessToken: string,
  ): Promise<DeletePropertyResponse> {
    return this.propertiesService.remove(id, accessToken);
  }
}
