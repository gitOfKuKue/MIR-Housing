'use client';

import {
  createProperty,
  updateProperty,
  uploadPropertyImages,
  type CreatePropertyPayload,
  type UpdatePropertyPayload,
} from '@/src/lib/api';
import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type {
  DryingAreaType,
  MainGateLockType,
  ParkingType,
  Property,
  PropertyStatus,
  PropertyType,
  ToiletType,
} from '@/src/types/property';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import HcmcLocationSelects, {
  type HcmcLocationValue,
} from './HcmcLocationSelects';

const HCMC_CITY = 'Ho Chi Minh City';
const HCMC_PROVINCE = 'Ho Chi Minh';
const HCMC_COUNTRY = 'VN';

const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'condo',
  'house',
  'townhouse',
  'other',
];

const PROPERTY_STATUSES: PropertyStatus[] = [
  'available',
  'rented',
  'maintenance',
  'inactive',
];

const PRIVATE_SHARED: Array<ToiletType | ParkingType | DryingAreaType | ''> = [
  '',
  'private',
  'shared',
];

const MAIN_GATE_LOCKS: Array<MainGateLockType | ''> = ['', 'standard', 'none'];

const MAX_IMAGE_COUNT = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const inputClassName =
  'w-full rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:bg-white focus:ring-2 focus:ring-[#1e4636]/10';

const labelClassName = 'mb-1.5 block text-sm font-medium text-[#4b5563]';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V7M12 7l-3.5 3.5M12 7l3.5 3.5M5 16.5V18a2 2 0 002 2h10a2 2 0 002-2v-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalInt(value: string): number | undefined {
  const parsed = parseOptionalNumber(value);
  if (parsed === undefined) return undefined;
  return Math.trunc(parsed);
}

function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const hasTrailingDot = cleaned.endsWith('.') && cleaned.indexOf('.') === cleaned.length - 1;
  const [rawInteger = '', ...rawFractionParts] = cleaned.split('.');
  const integerPart = rawInteger.replace(/^0+(?=\d)/, '') || (cleaned.startsWith('.') ? '0' : '');
  const fractionPart = rawFractionParts.join('').replace(/\D/g, '').slice(0, 2);

  if (!integerPart && !fractionPart && !hasTrailingDot) {
    return '';
  }

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (hasTrailingDot && !fractionPart) {
    return `${formattedInteger}.`;
  }

  return fractionPart ? `${formattedInteger}.${fractionPart}` : formattedInteger;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatInitialCurrency(value: number | null): string {
  if (value === null || value === undefined) return '';
  return formatCurrencyInput(String(value));
}

function formatInitialNumber(value: number | null): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

interface CreatePropertyFormProps {
  property?: Property;
}

export default function CreatePropertyForm({
  property,
}: CreatePropertyFormProps = {}) {
  const t = useTranslations();
  const isEdit = Boolean(property);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);

  const [name, setName] = useState(property?.name ?? '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    property?.property_type ?? 'apartment',
  );
  const [status, setStatus] = useState<PropertyStatus>(
    property?.status ?? 'available',
  );
  const [addressLine1, setAddressLine1] = useState(property?.address_line1 ?? '');
  const [addressLine2, setAddressLine2] = useState(property?.address_line2 ?? '');
  const [location, setLocation] = useState<HcmcLocationValue>({
    districtCode: null,
    district: property?.district ?? '',
    ward: property?.ward ?? '',
    street: property?.street ?? '',
  });
  const [city] = useState(property?.city ?? HCMC_CITY);
  const [province] = useState(property?.province ?? HCMC_PROVINCE);
  const [postalCode, setPostalCode] = useState(property?.postal_code ?? '');
  const [country] = useState(property?.country ?? HCMC_COUNTRY);
  const [rentAmount, setRentAmount] = useState(
    formatInitialCurrency(property?.rent_amount ?? null),
  );
  const [rentCurrency, setRentCurrency] = useState(
    property?.rent_currency ?? 'VND',
  );
  const [bedrooms, setBedrooms] = useState(
    formatInitialNumber(property?.bedrooms ?? null),
  );
  const [bathrooms, setBathrooms] = useState(
    formatInitialNumber(property?.bathrooms ?? null),
  );
  const [areaSqm, setAreaSqm] = useState(
    formatInitialNumber(property?.area_sqm ?? null),
  );
  const [roomType, setRoomType] = useState(property?.room_type ?? '');
  const [toiletType, setToiletType] = useState<ToiletType | ''>(
    property?.toilet_type ?? '',
  );
  const [parkingType, setParkingType] = useState<ParkingType | ''>(
    property?.parking_type ?? '',
  );
  const [mainGateLock, setMainGateLock] = useState<MainGateLockType | ''>(
    property?.main_gate_lock ?? '',
  );
  const [maxOccupants, setMaxOccupants] = useState(
    formatInitialNumber(property?.max_occupants ?? null),
  );
  const [maxBikes, setMaxBikes] = useState(
    formatInitialNumber(property?.max_bikes ?? null),
  );
  const [floor, setFloor] = useState(property?.floor ?? '');
  const [dryingArea, setDryingArea] = useState<DryingAreaType | ''>(
    property?.drying_area ?? '',
  );
  const [depositMonths, setDepositMonths] = useState(
    formatInitialNumber(property?.deposit_months ?? null),
  );
  const [holdingDeposit, setHoldingDeposit] = useState(
    formatInitialCurrency(property?.holding_deposit ?? null),
  );
  const [description, setDescription] = useState(property?.description ?? '');
  const [internalNotes, setInternalNotes] = useState(
    property?.internal_notes ?? '',
  );

  useEffect(() => {
    return () => {
      setImages((prev) => {
        prev.forEach((image) => URL.revokeObjectURL(image.url));
        return prev;
      });
    };
  }, []);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setImageError('');

    const incoming = Array.from(fileList);
    const nextImages = [...images];
    const rejectionMessages: string[] = [];
    const existingCount = property?.images.length ?? 0;

    for (const file of incoming) {
      if (existingCount + nextImages.length >= MAX_IMAGE_COUNT) {
        rejectionMessages.push(`You can upload up to ${MAX_IMAGE_COUNT} images.`);
        break;
      }

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        rejectionMessages.push(
          `"${file.name}" is not a supported image type (JPEG, PNG, WebP).`,
        );
        continue;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        rejectionMessages.push(`"${file.name}" is larger than 5 MB.`);
        continue;
      }

      const alreadyAdded = nextImages.some(
        (image) =>
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified === file.lastModified,
      );

      if (alreadyAdded) {
        continue;
      }

      nextImages.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      });
    }

    setImages(nextImages);

    if (rejectionMessages.length > 0) {
      setImageError(rejectionMessages[0]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((image) => image.id !== id);
    });
    setImageError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setImageError('');
    setSubmitting(true);

    try {
      const basePayload = {
        name: name.trim(),
        property_type: propertyType,
        status,
        address_line1: addressLine1.trim(),
        city: city.trim() || HCMC_CITY,
        province: province.trim() || HCMC_PROVINCE,
        country: country.trim() || HCMC_COUNTRY,
        rent_currency: rentCurrency.trim() || 'VND',
        address_line2: addressLine2.trim() || null,
        district: location.district.trim() || null,
        ward: location.ward.trim() || null,
        street: location.street.trim() || null,
        postal_code: postalCode.trim() || null,
        room_type: roomType.trim() || null,
        floor: floor.trim() || null,
        description: description.trim() || null,
        internal_notes: internalNotes.trim() || null,
        toilet_type: toiletType || null,
        parking_type: parkingType || null,
        main_gate_lock: mainGateLock || null,
        drying_area: dryingArea || null,
        rent_amount: parseOptionalNumber(rentAmount) ?? null,
        bedrooms: parseOptionalInt(bedrooms) ?? null,
        bathrooms: parseOptionalNumber(bathrooms) ?? null,
        area_sqm: parseOptionalNumber(areaSqm) ?? null,
        max_occupants: parseOptionalInt(maxOccupants) ?? null,
        max_bikes: parseOptionalInt(maxBikes) ?? null,
        deposit_months: parseOptionalInt(depositMonths) ?? null,
        holding_deposit: parseOptionalNumber(holdingDeposit) ?? null,
      };

      if (isEdit && property) {
        const payload: UpdatePropertyPayload = basePayload;
        await updateProperty(property.id, payload);

        if (images.length > 0) {
          await uploadPropertyImages(
            property.id,
            images.map((image) => image.file),
            property.images.length,
          );
        }

        router.push(`/properties/${property.id}`);
        return;
      }

      const payload: CreatePropertyPayload = {
        name: basePayload.name,
        property_type: basePayload.property_type,
        status: basePayload.status,
        address_line1: basePayload.address_line1,
        city: basePayload.city,
        province: basePayload.province,
        country: basePayload.country,
        rent_currency: basePayload.rent_currency,
      };

      if (basePayload.address_line2) payload.address_line2 = basePayload.address_line2;
      if (basePayload.district) payload.district = basePayload.district;
      if (basePayload.ward) payload.ward = basePayload.ward;
      if (basePayload.street) payload.street = basePayload.street;
      if (basePayload.postal_code) payload.postal_code = basePayload.postal_code;
      if (basePayload.room_type) payload.room_type = basePayload.room_type;
      if (basePayload.floor) payload.floor = basePayload.floor;
      if (basePayload.description) payload.description = basePayload.description;
      if (basePayload.internal_notes) payload.internal_notes = basePayload.internal_notes;
      if (basePayload.toilet_type) payload.toilet_type = basePayload.toilet_type;
      if (basePayload.parking_type) payload.parking_type = basePayload.parking_type;
      if (basePayload.main_gate_lock) payload.main_gate_lock = basePayload.main_gate_lock;
      if (basePayload.drying_area) payload.drying_area = basePayload.drying_area;
      if (basePayload.rent_amount !== null) payload.rent_amount = basePayload.rent_amount;
      if (basePayload.bedrooms !== null) payload.bedrooms = basePayload.bedrooms;
      if (basePayload.bathrooms !== null) payload.bathrooms = basePayload.bathrooms;
      if (basePayload.area_sqm !== null) payload.area_sqm = basePayload.area_sqm;
      if (basePayload.max_occupants !== null) payload.max_occupants = basePayload.max_occupants;
      if (basePayload.max_bikes !== null) payload.max_bikes = basePayload.max_bikes;
      if (basePayload.deposit_months !== null) payload.deposit_months = basePayload.deposit_months;
      if (basePayload.holding_deposit !== null) payload.holding_deposit = basePayload.holding_deposit;

      const created = await createProperty(payload);

      if (images.length > 0) {
        await uploadPropertyImages(
          created.id,
          images.map((image) => image.file),
          0,
        );
      }

      router.push(`/properties/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? t('form.updateFailed')
            : t('form.createFailed'),
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <Link
        href={isEdit && property ? `/properties/${property.id}` : '/properties'}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] transition hover:text-[#1e4636]"
      >
        <BackIcon />
        {isEdit ? t('form.backToProperty') : t('detail.backToProperties')}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">
          {isEdit ? t('form.editTitle') : t('form.createTitle')}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          {isEdit ? t('form.editSubtitle') : t('form.createSubtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-[#e8e4dc] bg-white p-6 shadow-sm"
      >
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('form.basicInfo')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClassName}>
                {t('form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                placeholder="e.g. Masteri Thao Dien - Unit 15.08"
              />
            </div>

            <div>
              <label htmlFor="property_type" className={labelClassName}>
                {t('form.propertyType')}
              </label>
              <select
                id="property_type"
                value={propertyType}
                onChange={(e) =>
                  setPropertyType(e.target.value as PropertyType)
                }
                className={inputClassName}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`type.${type}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className={labelClassName}>
                {t('form.status')}
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className={inputClassName}
              >
                {PROPERTY_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {t(`status.${item}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                {t('form.images')}
              </h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                {isEdit
                  ? t('form.imagesEditHint')
                  : t('form.imagesHint', { max: MAX_IMAGE_COUNT })}
              </p>
            </div>
            <p className="text-sm font-medium text-[#6b7280]">
              {isEdit
                ? t('form.imagesTotal', {
                    count: (property?.images.length ?? 0) + images.length,
                    max: MAX_IMAGE_COUNT,
                  })
                : t('form.imagesSelected', {
                    count: images.length,
                    max: MAX_IMAGE_COUNT,
                  })}
            </p>
          </div>

          {isEdit && property && property.images.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.images.map((image, index) => (
                <li
                  key={image.id}
                  className="overflow-hidden rounded-lg border border-[#e8e4dc] bg-white"
                >
                  <div className="relative aspect-[4/3] bg-[#f3f4f6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.public_url}
                      alt={`${t('form.existingImage')} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-md bg-[#1e4636] px-2 py-1 text-[11px] font-semibold text-white">
                        {t('form.cover')}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-[#6b7280]">
                      {t('form.existingImage')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4">
            <input
              ref={fileInputRef}
              id="property_images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => handleFilesSelected(event.target.files)}
            />

            <label
              htmlFor="property_images"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#d1d5db] bg-[#fafaf9] px-6 py-10 text-center transition hover:border-[#1e4636] hover:bg-[#f3f7f5]"
            >
              <span className="text-[#1e4636]">
                <UploadIcon />
              </span>
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {t('form.clickToSelect')}
              </span>
              <span className="text-xs text-[#6b7280]">
                {t('form.multiSelectHint')}
              </span>
            </label>
          </div>

          {imageError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {imageError}
            </div>
          ) : null}

          {images.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <li
                  key={image.id}
                  className="overflow-hidden rounded-lg border border-[#e8e4dc] bg-white"
                >
                  <div className="relative aspect-[4/3] bg-[#f3f4f6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-md bg-[#1e4636] px-2 py-1 text-[11px] font-semibold text-white">
                        {t('form.cover')}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1a1a1a]">
                        {image.file.name}
                      </p>
                      <p className="mt-1 text-xs text-[#6b7280]">
                        {formatFileSize(image.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      {t('form.remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('form.location')}
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">{t('form.hcmcOnly')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
              <HcmcLocationSelects
                value={location}
                onChange={setLocation}
                required
                showLabels
                selectClassName={inputClassName}
                labels={{
                  district: t('form.district'),
                  ward: t('form.ward'),
                  street: t('form.street'),
                  allDistricts: t('form.selectDistrict'),
                  allWards: t('form.selectWard'),
                  allStreets: t('form.selectStreet'),
                  loadingDistricts: t('form.loadingDistricts'),
                  loadingWards: t('form.loadingWards'),
                  loadingStreets: t('form.loadingStreets'),
                  selectDistrictFirst: t('form.selectDistrictFirst'),
                  selectWardFirst: t('form.selectWardFirst'),
                  noStreets: t('form.noStreets'),
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address_line1" className={labelClassName}>
                {t('form.addressLine1')} <span className="text-red-500">*</span>
              </label>
              <input
                id="address_line1"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className={inputClassName}
                placeholder="e.g. 123"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address_line2" className={labelClassName}>
                {t('form.addressLine2')}
              </label>
              <input
                id="address_line2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className={inputClassName}
                placeholder="Unit, floor, block (optional)"
              />
            </div>

            <div>
              <label htmlFor="city" className={labelClassName}>
                {t('form.city')} <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                required
                value={city}
                readOnly
                className={`${inputClassName} bg-[#f3f4f6] text-[#6b7280]`}
              />
            </div>

            <div>
              <label htmlFor="province" className={labelClassName}>
                {t('form.province')} <span className="text-red-500">*</span>
              </label>
              <input
                id="province"
                required
                value={province}
                readOnly
                className={`${inputClassName} bg-[#f3f4f6] text-[#6b7280]`}
              />
            </div>

            <div>
              <label htmlFor="postal_code" className={labelClassName}>
                {t('form.postalCode')}
              </label>
              <input
                id="postal_code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="country" className={labelClassName}>
                {t('form.country')}
              </label>
              <input
                id="country"
                value={country}
                readOnly
                maxLength={2}
                className={`${inputClassName} bg-[#f3f4f6] text-[#6b7280]`}
                placeholder="VN"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('form.rentSize')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="rent_amount" className={labelClassName}>
                {t('form.rentAmount')}
              </label>
              <input
                id="rent_amount"
                type="text"
                inputMode="decimal"
                value={rentAmount}
                onChange={(e) => setRentAmount(formatCurrencyInput(e.target.value))}
                className={inputClassName}
                placeholder="e.g. 28,000,000"
              />
            </div>

            <div>
              <label htmlFor="rent_currency" className={labelClassName}>
                {t('form.currency')}
              </label>
              <input
                id="rent_currency"
                value={rentCurrency}
                onChange={(e) => setRentCurrency(e.target.value)}
                maxLength={3}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="area_sqm" className={labelClassName}>
                {t('form.areaSqm')}
              </label>
              <input
                id="area_sqm"
                type="number"
                min={0}
                step="0.01"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className={labelClassName}>
                {t('form.bedrooms')}
              </label>
              <input
                id="bedrooms"
                type="number"
                min={0}
                step={1}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className={labelClassName}>
                {t('form.bathrooms')}
              </label>
              <input
                id="bathrooms"
                type="number"
                min={0}
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('form.roomInfo')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="room_type" className={labelClassName}>
                {t('form.roomType')}
              </label>
              <input
                id="room_type"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className={inputClassName}
                placeholder="e.g. 2BR Standard"
              />
            </div>

            <div>
              <label htmlFor="floor" className={labelClassName}>
                {t('form.floor')}
              </label>
              <input
                id="floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="toilet_type" className={labelClassName}>
                {t('form.toilet')}
              </label>
              <select
                id="toilet_type"
                value={toiletType}
                onChange={(e) =>
                  setToiletType(e.target.value as ToiletType | '')
                }
                className={inputClassName}
              >
                <option value="">{t('common.notSet')}</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {t(`value.${item}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="parking_type" className={labelClassName}>
                {t('form.parking')}
              </label>
              <select
                id="parking_type"
                value={parkingType}
                onChange={(e) =>
                  setParkingType(e.target.value as ParkingType | '')
                }
                className={inputClassName}
              >
                <option value="">{t('common.notSet')}</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {t(`value.${item}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="main_gate_lock" className={labelClassName}>
                {t('form.mainGateLock')}
              </label>
              <select
                id="main_gate_lock"
                value={mainGateLock}
                onChange={(e) =>
                  setMainGateLock(e.target.value as MainGateLockType | '')
                }
                className={inputClassName}
              >
                {MAIN_GATE_LOCKS.map((item) => (
                  <option key={item || 'empty'} value={item}>
                    {item
                      ? t(`value.${item}` as TranslationKey)
                      : t('common.notSet')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="drying_area" className={labelClassName}>
                {t('form.dryingArea')}
              </label>
              <select
                id="drying_area"
                value={dryingArea}
                onChange={(e) =>
                  setDryingArea(e.target.value as DryingAreaType | '')
                }
                className={inputClassName}
              >
                <option value="">{t('common.notSet')}</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {t(`value.${item}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="max_occupants" className={labelClassName}>
                {t('form.maxOccupants')}
              </label>
              <input
                id="max_occupants"
                type="number"
                min={0}
                step={1}
                value={maxOccupants}
                onChange={(e) => setMaxOccupants(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="max_bikes" className={labelClassName}>
                {t('form.maxBikes')}
              </label>
              <input
                id="max_bikes"
                type="number"
                min={0}
                step={1}
                value={maxBikes}
                onChange={(e) => setMaxBikes(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="deposit_months" className={labelClassName}>
                {t('form.depositMonths')}
              </label>
              <input
                id="deposit_months"
                type="number"
                min={0}
                step={1}
                value={depositMonths}
                onChange={(e) => setDepositMonths(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="holding_deposit" className={labelClassName}>
                {t('form.holdingDeposit')}
              </label>
              <input
                id="holding_deposit"
                type="text"
                inputMode="decimal"
                value={holdingDeposit}
                onChange={(e) =>
                  setHoldingDeposit(formatCurrencyInput(e.target.value))
                }
                className={inputClassName}
                placeholder="e.g. 56,000,000"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('form.notes')}
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label htmlFor="description" className={labelClassName}>
                {t('form.description')}
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClassName}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="internal_notes" className={labelClassName}>
                {t('form.internalNotes')}
              </label>
              <textarea
                id="internal_notes"
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className={inputClassName}
                placeholder={t('form.internalNotesPlaceholder')}
              />
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#f3f4f6] pt-6">
          <Link
            href={isEdit && property ? `/properties/${property.id}` : '/properties'}
            className="inline-flex rounded-lg border border-[#e5e7eb] px-5 py-2.5 text-sm font-semibold text-[#4b5563] transition hover:border-[#1e4636] hover:text-[#1e4636]"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting
              ? isEdit
                ? t('common.saving')
                : t('form.creating')
              : isEdit
                ? t('form.saveChanges')
                : t('form.create')}
          </button>
        </div>
      </form>
    </div>
  );
}
