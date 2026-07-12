import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { readFileSync, unlinkSync } from 'node:fs';
import { PostgrestError } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import {
  buildPaginationMeta,
  PaginatedResponse,
} from '../common/pagination/paginated-response.interface';
import { resolvePagination } from '../common/pagination/pagination-query.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreatePropertyUtilityBillDto } from './dto/create-property-utility-bill.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { QueryPropertyUtilityBillsDto } from './dto/query-property-utility-bills.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UpdatePropertyUtilityBillDto } from './dto/update-property-utility-bill.dto';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyUtilityBill } from './entities/property-utility-bill.entity';
import {
  mapPropertyWithImages,
  PropertyWithImages,
} from './entities/property-with-images.entity';
import { DeletePropertyResponse } from './interfaces/delete-property-response.interface';
import { BulkCreatePropertiesResponse } from './interfaces/bulk-create-properties-response.interface';
import {
  ListPropertyImagesResponse,
  PropertyImageWithUrl,
  UploadPropertyImagesResponse,
} from './interfaces/property-image-response.interface';
import {
  DeletePropertyUtilityBillResponse,
  ListPropertyUtilityBillsResponse,
} from './interfaces/property-utility-bill-response.interface';
import { UtilityBillStatus } from './enums/utility-bill-status.enum';
import {
  PROPERTIES_TABLE,
  PROPERTY_IMAGE_MAX_UPLOAD_COUNT,
  PROPERTY_IMAGES_BUCKET,
  PROPERTY_IMAGES_TABLE,
  PROPERTY_SELECT_WITH_IMAGES,
  PROPERTY_UTILITY_BILLS_TABLE,
} from './properties.constants';
import { applyPropertyFilters } from './utils/apply-property-filters';
import { resolveImageFile } from './utils/resolve-image-file';

@Injectable()
export class PropertiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(
    query: QueryPropertiesDto,
    accessToken: string,
  ): Promise<PaginatedResponse<PropertyWithImages>> {
    const supabase = this.supabaseService.getClient(accessToken);
    const { page, limit, from, to } = resolvePagination(query.page, query.limit);

    let builder = supabase
      .from(PROPERTIES_TABLE)
      .select(PROPERTY_SELECT_WITH_IMAGES, { count: 'exact' })
      .is('deleted_at', null);

    builder = applyPropertyFilters(builder, query);

    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      this.handleSupabaseError(error);
    }

    const total = count ?? 0;
    const getPublicUrl = (storagePath: string) =>
      this.getPublicImageUrl(supabase, storagePath);

    return {
      data: (data ?? []).map((row) => mapPropertyWithImages(row, getPublicUrl)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string, accessToken: string): Promise<PropertyWithImages> {
    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase
      .from(PROPERTIES_TABLE)
      .select(PROPERTY_SELECT_WITH_IMAGES)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      this.handleSupabaseError(error);
    }

    if (!data) {
      throw new NotFoundException(`Property with id "${id}" not found`);
    }

    return mapPropertyWithImages(data, (storagePath) =>
      this.getPublicImageUrl(supabase, storagePath),
    );
  }

  async create(
    dto: CreatePropertyDto,
    userId: string,
    accessToken: string,
  ): Promise<Property> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from(PROPERTIES_TABLE)
      .insert({
        ...dto,
        created_by: dto.created_by ?? userId,
      })
      .select('*')
      .single();

    if (error) {
      this.handleSupabaseError(error);
    }

    return data as Property;
  }

  async createBulk(
    dtos: CreatePropertyDto[],
    userId: string,
    accessToken: string,
  ): Promise<BulkCreatePropertiesResponse> {
    const supabase = this.supabaseService.getClient(accessToken);

    const rows = dtos.map((dto) => ({
      ...dto,
      created_by: dto.created_by ?? userId,
    }));

    const { data, error } = await supabase
      .from(PROPERTIES_TABLE)
      .insert(rows)
      .select('*');

    if (error) {
      this.handleSupabaseError(error);
    }

    const properties = (data ?? []) as Property[];

    return {
      data: properties,
      meta: { created: properties.length },
    };
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    accessToken: string,
  ): Promise<Property> {
    await this.findOne(id, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase
      .from(PROPERTIES_TABLE)
      .update(dto)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) {
      this.handleSupabaseError(error);
    }

    return data as Property;
  }

  async remove(
    id: string,
    accessToken: string,
  ): Promise<DeletePropertyResponse> {
    await this.findOne(id, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase.rpc('soft_delete_property', {
      property_id: id,
    });

    if (error) {
      this.handleSupabaseError(error);
    }

    return {
      id,
      deleted_at: data as string,
      message: 'Property deleted successfully',
    };
  }

  async uploadImages(
    propertyId: string,
    files: Express.Multer.File[],
    accessToken: string,
    sortOrder = 0,
  ): Promise<UploadPropertyImagesResponse> {
    await this.findOne(propertyId, accessToken);

    if (!files.length) {
      throw new BadRequestException('At least one image file is required');
    }

    if (files.length > PROPERTY_IMAGE_MAX_UPLOAD_COUNT) {
      throw new BadRequestException(
        `You can upload up to ${PROPERTY_IMAGE_MAX_UPLOAD_COUNT} images at once`,
      );
    }

    const uploaded: PropertyImageWithUrl[] = [];

    for (const [index, file] of files.entries()) {
      uploaded.push(
        await this.uploadSingleImage(
          propertyId,
          file,
          accessToken,
          sortOrder + index,
        ),
      );
    }

    return {
      data: uploaded,
      meta: { uploaded: uploaded.length },
    };
  }

  private async uploadSingleImage(
    propertyId: string,
    file: Express.Multer.File,
    accessToken: string,
    sortOrder: number,
  ): Promise<PropertyImageWithUrl> {
    const resolvedImage = resolveImageFile(file);

    const fileBuffer =
      file.buffer ??
      (file.path ? (() => {
        try {
          return readFileSync(file.path);
        } finally {
          // Best-effort cleanup for disk uploads.
          try {
            unlinkSync(file.path);
          } catch {
            // ignore
          }
        }
      })() : undefined);

    if (!fileBuffer) {
      throw new BadRequestException(
        'Uploaded image buffer is missing (check multer configuration).',
      );
    }

    const serviceClient = this.supabaseService.getServiceClient();
    const storagePath = `${propertyId}/${randomUUID()}.${resolvedImage.extension}`;

    const { error: uploadError } = await serviceClient.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: resolvedImage.mimeType,
        upsert: false,
      });

    if (uploadError) {
      this.handleStorageError(uploadError);
    }

    const { data, error } = await serviceClient
      .from(PROPERTY_IMAGES_TABLE)
      .insert({
        property_id: propertyId,
        storage_path: storagePath,
        sort_order: sortOrder,
      })
      .select('*')
      .single();

    if (error) {
      await serviceClient.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .remove([storagePath]);
      this.handleSupabaseError(error);
    }

    const image = data as PropertyImage;
    const readClient = this.supabaseService.getClient(accessToken);

    return {
      ...image,
      public_url: this.getPublicImageUrl(readClient, storagePath),
    };
  }

  async listImages(
    propertyId: string,
    accessToken: string,
  ): Promise<ListPropertyImagesResponse> {
    await this.findOne(propertyId, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase
      .from(PROPERTY_IMAGES_TABLE)
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      this.handleSupabaseError(error);
    }

    const images = (data ?? []) as PropertyImage[];

    return {
      data: images.map((image) => ({
        ...image,
        public_url: this.getPublicImageUrl(supabase, image.storage_path),
      })),
    };
  }

  async listUtilityBills(
    propertyId: string,
    query: QueryPropertyUtilityBillsDto,
    accessToken: string,
  ): Promise<ListPropertyUtilityBillsResponse> {
    await this.findOne(propertyId, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    let builder = supabase
      .from(PROPERTY_UTILITY_BILLS_TABLE)
      .select('*')
      .eq('property_id', propertyId);

    if (query.bill_type) {
      builder = builder.eq('bill_type', query.bill_type);
    }

    if (query.status) {
      builder = builder.eq('status', query.status);
    }

    const { data, error } = await builder
      .order('billing_period_start', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      this.handleSupabaseError(error);
    }

    return { data: (data ?? []) as PropertyUtilityBill[] };
  }

  async createUtilityBill(
    propertyId: string,
    dto: CreatePropertyUtilityBillDto,
    userId: string,
    accessToken: string,
  ): Promise<PropertyUtilityBill> {
    await this.findOne(propertyId, accessToken);
    this.validateBillingPeriod(dto.billing_period_start, dto.billing_period_end);

    const supabase = this.supabaseService.getClient(accessToken);
    const status = dto.status ?? UtilityBillStatus.NeedsPayment;

    const { data, error } = await supabase
      .from(PROPERTY_UTILITY_BILLS_TABLE)
      .insert({
        property_id: propertyId,
        bill_type: dto.bill_type,
        billing_period_start: dto.billing_period_start,
        billing_period_end: dto.billing_period_end,
        amount: dto.amount,
        currency: dto.currency ?? 'VND',
        due_date: dto.due_date ?? null,
        status,
        paid_at:
          status === UtilityBillStatus.NoPaymentNeeded
            ? new Date().toISOString()
            : null,
        provider_name: dto.provider_name ?? null,
        account_number: dto.account_number ?? null,
        notes: dto.notes ?? null,
        created_by: userId,
      })
      .select('*')
      .single();

    if (error) {
      this.handleSupabaseError(error);
    }

    return data as PropertyUtilityBill;
  }

  async updateUtilityBill(
    propertyId: string,
    billId: string,
    dto: UpdatePropertyUtilityBillDto,
    accessToken: string,
  ): Promise<PropertyUtilityBill> {
    await this.getUtilityBill(propertyId, billId, accessToken);

    if (dto.billing_period_start && dto.billing_period_end) {
      this.validateBillingPeriod(dto.billing_period_start, dto.billing_period_end);
    }

    const supabase = this.supabaseService.getClient(accessToken);
    const updatePayload: Record<string, unknown> = { ...dto };

    if (dto.status === UtilityBillStatus.NoPaymentNeeded) {
      updatePayload.paid_at = new Date().toISOString();
    }

    if (dto.status === UtilityBillStatus.NeedsPayment) {
      updatePayload.paid_at = null;
    }

    const { data, error } = await supabase
      .from(PROPERTY_UTILITY_BILLS_TABLE)
      .update(updatePayload)
      .eq('id', billId)
      .eq('property_id', propertyId)
      .select('*')
      .single();

    if (error) {
      this.handleSupabaseError(error);
    }

    return data as PropertyUtilityBill;
  }

  async removeUtilityBill(
    propertyId: string,
    billId: string,
    accessToken: string,
  ): Promise<DeletePropertyUtilityBillResponse> {
    await this.getUtilityBill(propertyId, billId, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    const { error } = await supabase
      .from(PROPERTY_UTILITY_BILLS_TABLE)
      .delete()
      .eq('id', billId)
      .eq('property_id', propertyId);

    if (error) {
      this.handleSupabaseError(error);
    }

    return {
      id: billId,
      message: 'Utility bill deleted successfully',
    };
  }

  private async getUtilityBill(
    propertyId: string,
    billId: string,
    accessToken: string,
  ): Promise<PropertyUtilityBill> {
    await this.findOne(propertyId, accessToken);

    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase
      .from(PROPERTY_UTILITY_BILLS_TABLE)
      .select('*')
      .eq('id', billId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      this.handleSupabaseError(error);
    }

    if (!data) {
      throw new NotFoundException(
        `Utility bill with id "${billId}" not found for this property`,
      );
    }

    return data as PropertyUtilityBill;
  }

  private validateBillingPeriod(start: string, end: string): void {
    if (new Date(end) < new Date(start)) {
      throw new BadRequestException(
        'billing_period_end must be on or after billing_period_start',
      );
    }
  }

  private getPublicImageUrl(
    supabase: ReturnType<SupabaseService['getClient']>,
    storagePath: string,
  ): string {
    const { data } = supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  private handleStorageError(error: { message: string }): never {
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new InternalServerErrorException(
        'Storage bucket property-images is missing. Run migration 005_property_images.sql in Supabase.',
      );
    }

    throw new InternalServerErrorException(error.message);
  }

  private handleSupabaseError(error: PostgrestError): never {
    if (
      error.message.includes('Only admins can delete properties') ||
      error.message.includes('Only admin or sale can delete properties')
    ) {
      throw new ForbiddenException(
        'Only admin or sale can delete properties',
      );
    }

    if (error.code === 'P0002' || error.message.includes('Property not found')) {
      throw new NotFoundException(`Property with id not found or already deleted`);
    }

    if (error.code === 'PGRST202' || error.message.includes('soft_delete_property')) {
      throw new InternalServerErrorException(
        'Database function soft_delete_property is missing. Run migration 003_soft_delete_rpc.sql in Supabase.',
      );
    }

    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new ForbiddenException(
        `Permission denied: ${error.message}`,
      );
    }

    if (error.code === '23505') {
      throw new BadRequestException(error.message);
    }

    if (error.code === '22P02' || error.code === '23514') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(error.message);
  }
}
