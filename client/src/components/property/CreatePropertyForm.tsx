'use client';

import {
  createProperty,
  updateProperty,
  uploadPropertyImages,
  upsertPropertyFurnishings,
  type CreatePropertyPayload,
  type UpdatePropertyPayload,
} from '@/src/lib/api';
import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  ROOM_TYPE_VALUES,
  isRoomTypeValue,
  type RoomTypeValue,
} from '@/src/lib/room-types';
import { AMENITY_VALUES, type AmenityValue } from '@/src/lib/amenities';
import {
  FURNISHING_VALUES,
  type FurnishingValue,
} from '@/src/lib/furnishings';
import {
  furnishingsToAmenityValues,
  furnishingsToFurnishingValues,
} from '@/src/lib/furnishings-selection';
import type {
  DryingAreaType,
  FeeWaterType,
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
import { AMENITY_LABEL_KEYS } from './AmenityMultiSelect';
import { FURNISHING_LABEL_KEYS } from './FurnishingMultiSelect';
import HcmcLocationSelects, {
  type HcmcLocationValue,
} from './HcmcLocationSelects';
import { ROOM_TYPE_LABEL_KEYS } from './RoomTypeSelect';

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

const PRIVATE_SHARED: Array<ToiletType | ParkingType | DryingAreaType | ''> = [
  '',
  'private',
  'shared',
];

const MAIN_GATE_LOCKS: Array<MainGateLockType | ''> = ['', 'standard', 'none'];

const FEE_WATER_TYPES: FeeWaterType[] = ['fixed', 'per_m3'];

const MAX_IMAGE_COUNT = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const inputClassName =
  'h-9 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/15';

const smallInputClassName =
  'h-8 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/15';

const labelClassName =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]';

const subheadingClassName =
  'mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280]';

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
      width="20"
      height="20"
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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l5 5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionHeading({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-[#f3f4f6] pb-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f3ed] text-xs font-semibold text-[#1e4636]">
        {number}
      </span>
      <h2 className="text-sm font-semibold text-[#1a1a1a]">{title}</h2>
    </div>
  );
}

function CheckboxGrid<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  labelFor: (option: T) => string;
}) {
  const selected = new Set(value);

  function toggle(option: T) {
    if (selected.has(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const checked = selected.has(option);
        return (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f9fafb]"
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                checked
                  ? 'border-[#1e4636] bg-[#1e4636] text-white'
                  : 'border-[#d1d5db] bg-white'
              }`}
            >
              {checked ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l5 5L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(option)}
            />
            {labelFor(option)}
          </label>
        );
      })}
    </div>
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

function normalizeFeeAmount(value: string): string | null {
  const digits = value.replace(/[^\d.]/g, '').replace(/\.$/, '');
  return digits || null;
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
  const [roomType, setRoomType] = useState(
    property?.room_type && isRoomTypeValue(property.room_type)
      ? property.room_type
      : '',
  );
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
  const [zaloGroupLink, setZaloGroupLink] = useState(
    property?.zalo_group_link ?? '',
  );
  const [feeElectricity, setFeeElectricity] = useState(
    formatCurrencyInput(property?.fee_electricity ?? ''),
  );
  const [feeWater, setFeeWater] = useState(
    formatCurrencyInput(property?.fee_water ?? ''),
  );
  const [feeWaterType, setFeeWaterType] = useState<FeeWaterType>(
    property?.fee_water_type ?? 'per_m3',
  );
  const [feeMotorbike, setFeeMotorbike] = useState(
    formatCurrencyInput(property?.fee_motorbike ?? ''),
  );
  const [feeCar, setFeeCar] = useState(
    formatCurrencyInput(property?.fee_car ?? ''),
  );
  const [feeWifi, setFeeWifi] = useState(
    formatCurrencyInput(property?.fee_wifi ?? ''),
  );
  const [feeManagement, setFeeManagement] = useState(
    formatCurrencyInput(property?.fee_management ?? ''),
  );
  const [feeService, setFeeService] = useState(
    formatCurrencyInput(property?.fee_service ?? ''),
  );
  const [amenities, setAmenities] = useState<AmenityValue[]>(() =>
    furnishingsToAmenityValues(property?.furnishings),
  );
  const [furnishings, setFurnishings] = useState<FurnishingValue[]>(() =>
    furnishingsToFurnishingValues(property?.furnishings),
  );

  useEffect(() => {
    return () => {
      setImages((prev) => {
        prev.forEach((image) => URL.revokeObjectURL(image.url));
        return prev;
      });
    };
  }, []);

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

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
      const areaValue = parseOptionalNumber(areaSqm);
      const basePayload: UpdatePropertyPayload = {
        name:
          name.trim() ||
          [addressLine1.trim(), location.street, location.ward, location.district]
            .filter(Boolean)
            .join(', ') ||
          'Untitled property',
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
        zalo_group_link: zaloGroupLink.trim() || null,
        fee_electricity: normalizeFeeAmount(feeElectricity),
        fee_water: normalizeFeeAmount(feeWater),
        fee_water_type: normalizeFeeAmount(feeWater) ? feeWaterType : null,
        fee_motorbike: normalizeFeeAmount(feeMotorbike),
        fee_car: normalizeFeeAmount(feeCar),
        fee_wifi: normalizeFeeAmount(feeWifi),
        fee_management: normalizeFeeAmount(feeManagement),
        fee_service: normalizeFeeAmount(feeService),
        toilet_type: toiletType || null,
        parking_type: parkingType || null,
        main_gate_lock: mainGateLock || null,
        drying_area: dryingArea || null,
        rent_amount: parseOptionalNumber(rentAmount) ?? null,
        bedrooms: parseOptionalInt(bedrooms) ?? null,
        bathrooms: parseOptionalNumber(bathrooms) ?? null,
        // DB constraint: area_sqm is null or > 0
        area_sqm:
          areaValue !== undefined && areaValue > 0 ? areaValue : null,
        max_occupants: parseOptionalInt(maxOccupants) ?? null,
        max_bikes: parseOptionalInt(maxBikes) ?? null,
        deposit_months: parseOptionalInt(depositMonths) ?? null,
        holding_deposit: parseOptionalNumber(holdingDeposit) ?? null,
      };

      let propertyId: string;
      if (isEdit && property) {
        await updateProperty(property.id, basePayload);
        propertyId = property.id;
      } else {
        const created = await createProperty(
          Object.fromEntries(
            Object.entries(basePayload).filter(
              ([, value]) => value !== null && value !== undefined,
            ),
          ) as CreatePropertyPayload,
        );
        propertyId = created.id;
      }

      await upsertPropertyFurnishings(propertyId, {
        amenities,
        furnishings,
      });

      if (images.length > 0) {
        await uploadPropertyImages(
          propertyId,
          images.map((image) => image.file),
          property?.images.length ?? 0,
        );
      }

      router.push(`/properties/${propertyId}`);
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

  const backHref =
    isEdit && property ? `/properties/${property.id}` : '/properties';
  const rentPreview = parseOptionalNumber(rentAmount);

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#f3f4f6] px-4 py-3 sm:px-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] transition hover:text-[#1a1a1a]"
        >
          <BackIcon />
          {t('form.back')}
        </Link>
        <span className="text-[#e5e7eb]">|</span>
        <h1 className="text-sm font-semibold text-[#1a1a1a]">
          {isEdit ? t('form.editTitle') : t('form.createTitle')}
        </h1>
        <button
          type="submit"
          form="property-form"
          disabled={submitting}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1e4636] px-4 text-sm font-medium text-white transition hover:bg-[#163828] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CheckIcon />
          {submitting ? t('common.saving') : t('form.saveRoom')}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <form
          id="property-form"
          onSubmit={handleSubmit}
          className="w-full space-y-10 px-4 py-8 sm:px-8 lg:px-10"
        >
          <section>
            <SectionHeading number={1} title={t('form.sectionAddress')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
                <HcmcLocationSelects
                  value={location}
                  onChange={setLocation}
                  required
                  showLabels
                  selectClassName={inputClassName}
                  labelClassName={labelClassName}
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
              <div>
                <label htmlFor="address_line1" className={labelClassName}>
                  {t('form.houseNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="address_line1"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className={inputClassName}
                  placeholder={t('form.houseNumberPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="name" className={labelClassName}>
                  {t('form.name')}
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                  placeholder={t('form.nameOptionalPlaceholder')}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading number={2} title={t('form.sectionBasic')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="room_type" className={labelClassName}>
                  {t('form.roomType')}
                </label>
                <select
                  id="room_type"
                  value={roomType}
                  onChange={(e) =>
                    setRoomType(
                      e.target.value === ''
                        ? ''
                        : (e.target.value as RoomTypeValue),
                    )
                  }
                  className={inputClassName}
                >
                  <option value="">{t('form.selectRoomType')}</option>
                  {ROOM_TYPE_VALUES.map((option) => (
                    <option key={option} value={option}>
                      {t(ROOM_TYPE_LABEL_KEYS[option])}
                    </option>
                  ))}
                </select>
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
                  placeholder={t('form.floorPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="area_sqm" className={labelClassName}>
                  {t('form.areaSqm')}
                </label>
                <input
                  id="area_sqm"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className={inputClassName}
                  placeholder={t('form.areaPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="rent_amount" className={labelClassName}>
                  {t('form.rentAmountVnd')}
                </label>
                <div className="relative">
                  <input
                    id="rent_amount"
                    type="text"
                    inputMode="decimal"
                    value={rentAmount}
                    onChange={(e) =>
                      setRentAmount(formatCurrencyInput(e.target.value))
                    }
                    className={`${inputClassName} pr-8 font-mono`}
                    placeholder={t('form.rentPlaceholder')}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
                    đ
                  </span>
                </div>
                {rentPreview ? (
                  <p className="mt-1.5 text-xs font-medium text-[#1e4636]">
                    {rentPreview.toLocaleString('vi-VN')} đ/{t('list.perMonth')}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <SectionHeading number={3} title={t('form.sectionAmenities')} />
            <CheckboxGrid
              options={AMENITY_VALUES}
              value={amenities}
              onChange={setAmenities}
              labelFor={(option) => t(AMENITY_LABEL_KEYS[option])}
            />
          </section>

          <section>
            <SectionHeading number={4} title={t('form.sectionFurniture')} />
            <CheckboxGrid
              options={FURNISHING_VALUES}
              value={furnishings}
              onChange={setFurnishings}
              labelFor={(option) => t(FURNISHING_LABEL_KEYS[option])}
            />
          </section>

          <section>
            <SectionHeading number={5} title={t('form.sectionImages')} />
            {isEdit && property && property.images.length > 0 ? (
              <ul className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                {property.images.map((image, index) => (
                  <li
                    key={image.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.public_url}
                      alt={`${t('form.existingImage')} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {t('form.cover')}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <input
              ref={fileInputRef}
              id="property_images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => handleFilesSelected(event.target.files)}
            />

            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
              {images.map((image, index) => (
                <li
                  key={image.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.file.name}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {t('form.cover')}
                    </span>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      className="rounded bg-white/90 px-1.5 py-1 text-xs disabled:opacity-40"
                      aria-label="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="rounded bg-white/90 px-1.5 py-1 text-xs font-semibold text-red-600"
                    >
                      {t('form.remove')}
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                      className="rounded bg-white/90 px-1.5 py-1 text-xs disabled:opacity-40"
                      aria-label="Move right"
                    >
                      →
                    </button>
                  </div>
                </li>
              ))}
              <li>
                <label
                  htmlFor="property_images"
                  className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#d1d5db] bg-[#fafaf9] text-[#6b7280] transition hover:border-[#1e4636] hover:bg-[#f3f7f5] hover:text-[#1e4636]"
                >
                  <UploadIcon />
                  <span className="text-xs font-medium">{t('form.uploadImages')}</span>
                </label>
              </li>
            </ul>
            <p className="mt-2 text-xs text-[#9ca3af]">{t('form.imageOrderHint')}</p>
            {imageError ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {imageError}
              </div>
            ) : null}
          </section>

          <section>
            <SectionHeading number={6} title={t('form.sectionExtra')} />

            <p className={subheadingClassName}>{t('form.monthlyFees')}</p>
            <div className="mb-7 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="fee_electricity" className={labelClassName}>
                  {t('form.feeElectricity')}
                </label>
                <input
                  id="fee_electricity"
                  type="text"
                  inputMode="decimal"
                  value={feeElectricity}
                  onChange={(e) =>
                    setFeeElectricity(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeElectricityPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="fee_water" className={labelClassName}>
                  {t('form.feeWater')}
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input
                    id="fee_water"
                    type="text"
                    inputMode="decimal"
                    value={feeWater}
                    onChange={(e) =>
                      setFeeWater(formatCurrencyInput(e.target.value))
                    }
                    className={`${smallInputClassName} font-mono`}
                    placeholder={
                      feeWaterType === 'fixed'
                        ? t('form.feeWaterFixedPlaceholder')
                        : t('form.feeWaterPerM3Placeholder')
                    }
                  />
                  <select
                    id="fee_water_type"
                    aria-label={t('form.feeWaterType')}
                    value={feeWaterType}
                    onChange={(e) =>
                      setFeeWaterType(e.target.value as FeeWaterType)
                    }
                    className={smallInputClassName}
                  >
                    {FEE_WATER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === 'fixed'
                          ? t('form.feeWaterFixed')
                          : t('form.feeWaterPerM3')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="fee_motorbike" className={labelClassName}>
                  {t('form.feeMotorbike')}
                </label>
                <input
                  id="fee_motorbike"
                  type="text"
                  inputMode="decimal"
                  value={feeMotorbike}
                  onChange={(e) =>
                    setFeeMotorbike(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeMotorbikePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="fee_car" className={labelClassName}>
                  {t('form.feeCar')}
                </label>
                <input
                  id="fee_car"
                  type="text"
                  inputMode="decimal"
                  value={feeCar}
                  onChange={(e) =>
                    setFeeCar(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeCarPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="fee_wifi" className={labelClassName}>
                  {t('form.feeWifi')}
                </label>
                <input
                  id="fee_wifi"
                  type="text"
                  inputMode="decimal"
                  value={feeWifi}
                  onChange={(e) =>
                    setFeeWifi(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeWifiPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="fee_management" className={labelClassName}>
                  {t('form.feeManagement')}
                </label>
                <input
                  id="fee_management"
                  type="text"
                  inputMode="decimal"
                  value={feeManagement}
                  onChange={(e) =>
                    setFeeManagement(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeManagementPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="fee_service" className={labelClassName}>
                  {t('form.feeService')}
                </label>
                <input
                  id="fee_service"
                  type="text"
                  inputMode="decimal"
                  value={feeService}
                  onChange={(e) =>
                    setFeeService(formatCurrencyInput(e.target.value))
                  }
                  className={`${smallInputClassName} font-mono`}
                  placeholder={t('form.feeServicePlaceholder')}
                />
              </div>
            </div>

            <p className={subheadingClassName}>{t('form.roomDetails')}</p>
            <div className="mb-7 grid gap-3 sm:grid-cols-2">
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
                  className={smallInputClassName}
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
                  className={smallInputClassName}
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
                <label htmlFor="drying_area" className={labelClassName}>
                  {t('form.dryingArea')}
                </label>
                <select
                  id="drying_area"
                  value={dryingArea}
                  onChange={(e) =>
                    setDryingArea(e.target.value as DryingAreaType | '')
                  }
                  className={smallInputClassName}
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
                  className={smallInputClassName}
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
                  className={smallInputClassName}
                  placeholder="2"
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
                  className={smallInputClassName}
                  placeholder="1"
                />
              </div>
              <div>
                <label htmlFor="holding_deposit" className={labelClassName}>
                  {t('form.holdingDeposit')}
                </label>
                <div className="relative">
                  <input
                    id="holding_deposit"
                    type="text"
                    inputMode="decimal"
                    value={holdingDeposit}
                    onChange={(e) =>
                      setHoldingDeposit(formatCurrencyInput(e.target.value))
                    }
                    className={`${smallInputClassName} pr-8 font-mono`}
                    placeholder={t('form.depositPlaceholder')}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
                    đ
                  </span>
                </div>
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
                  className={smallInputClassName}
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
                  className={smallInputClassName}
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
                  className={smallInputClassName}
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
                  className={smallInputClassName}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`type.${type}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="zalo_group_link" className={labelClassName}>
                  {t('form.zaloGroupLink')}
                </label>
                <input
                  id="zalo_group_link"
                  type="text"
                  inputMode="url"
                  value={zaloGroupLink}
                  onChange={(e) => setZaloGroupLink(e.target.value)}
                  className={inputClassName}
                  placeholder={t('form.zaloGroupLinkPlaceholder')}
                />
              </div>
              <div>
                <span className={labelClassName}>{t('form.status')}</span>
                <div className="mt-1 flex flex-wrap gap-5">
                  {(['available', 'rented'] as PropertyStatus[]).map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 text-sm text-[#1a1a1a]"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={status === item}
                        onChange={() => setStatus(item)}
                        className="h-4 w-4 border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
                      />
                      {t(`status.${item}` as TranslationKey)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="status_extra" className={labelClassName}>
                  {t('form.statusOther')}
                </label>
                <select
                  id="status_extra"
                  value={
                    status === 'available' || status === 'rented' ? '' : status
                  }
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next) setStatus(next as PropertyStatus);
                  }}
                  className={inputClassName}
                >
                  <option value="">{t('common.notSet')}</option>
                  <option value="maintenance">
                    {t('status.maintenance')}
                  </option>
                  <option value="inactive">{t('status.inactive')}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label htmlFor="description" className={labelClassName}>
                  {t('form.notes')}
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClassName} h-auto resize-none py-2`}
                  placeholder={t('form.notesPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="internal_notes" className={labelClassName}>
                  {t('form.internalNotes')}
                </label>
                <textarea
                  id="internal_notes"
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className={`${inputClassName} h-auto resize-none py-2`}
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

          <div className="flex justify-end pb-12">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e4636] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#163828] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CheckIcon />
              {submitting ? t('common.saving') : t('form.saveRoom')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
