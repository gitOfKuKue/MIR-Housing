'use client';

import {
  createProperty,
  updateProperty,
  uploadRoomImages,
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
  FeeWaterType,
  Property,
  PropertyStatus,
  PropertyType,
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

function GroupBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8e4dc] bg-[#faf9f7] px-4 py-3 sm:px-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#1e4636]">
        {title}
      </p>
      <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
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
          <button
            key={option}
            type="button"
            aria-pressed={checked}
            onMouseDown={(event) => {
              // Avoid focus-driven scroll jumps that leave a blank white panel.
              event.preventDefault();
            }}
            onClick={() => toggle(option)}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-left text-sm text-[#1a1a1a] hover:bg-[#f9fafb]"
          >
            <span
              aria-hidden="true"
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
            {labelFor(option)}
          </button>
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

interface RoomDraft {
  key: string;
  id?: string;
  name: string;
  roomType: '' | RoomTypeValue;
  floor: string;
  areaSqm: string;
  rentAmount: string;
  status: PropertyStatus;
  bedrooms: string;
  bathrooms: string;
  depositMonths: string;
  holdingDeposit: string;
  description: string;
  furnishings: FurnishingValue[];
  images: ImagePreview[];
}

function createEmptyRoomDraft(
  overrides: Partial<RoomDraft> = {},
): RoomDraft {
  return {
    key:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `room-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: '',
    roomType: '',
    floor: '',
    areaSqm: '',
    rentAmount: '',
    status: 'available',
    bedrooms: '',
    bathrooms: '',
    depositMonths: '',
    holdingDeposit: '',
    description: '',
    furnishings: [],
    images: [],
    ...overrides,
  };
}

function roomDraftFromPropertyFields(property?: Property): RoomDraft {
  return createEmptyRoomDraft({
    roomType:
      property?.room_type && isRoomTypeValue(property.room_type)
        ? property.room_type
        : '',
    floor: property?.floor ?? '',
    areaSqm: formatInitialNumber(property?.area_sqm ?? null),
    rentAmount: formatInitialCurrency(property?.rent_amount ?? null),
    status: property?.status ?? 'available',
    bedrooms: formatInitialNumber(property?.bedrooms ?? null),
    bathrooms: formatInitialNumber(property?.bathrooms ?? null),
    depositMonths: formatInitialNumber(property?.deposit_months ?? null),
    holdingDeposit: formatInitialCurrency(property?.holding_deposit ?? null),
    description: property?.description ?? '',
    furnishings: furnishingsToFurnishingValues(property?.furnishings),
  });
}

function roomsFromProperty(property?: Property): RoomDraft[] {
  const existing = property?.rooms?.filter((room) => !room.deleted_at) ?? [];
  if (existing.length === 0) {
    return [roomDraftFromPropertyFields(property)];
  }

  return existing.map((room) =>
    createEmptyRoomDraft({
      key: room.id,
      id: room.id,
      name: room.name ?? '',
      roomType:
        room.room_type && isRoomTypeValue(room.room_type)
          ? room.room_type
          : '',
      floor: room.floor ?? '',
      areaSqm: formatInitialNumber(room.area_sqm),
      rentAmount: formatInitialCurrency(room.rent_amount),
      status: room.status ?? 'available',
      bedrooms: formatInitialNumber(room.bedrooms),
      bathrooms: formatInitialNumber(room.bathrooms),
      depositMonths: formatInitialNumber(room.deposit_months),
      holdingDeposit: formatInitialCurrency(room.holding_deposit),
      description: room.description ?? '',
      furnishings: furnishingsToFurnishingValues(
        room as unknown as Property['furnishings'],
      ),
    }),
  );
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
  const [rooms, setRooms] = useState<RoomDraft[]>(() =>
    roomsFromProperty(property),
  );
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const [name, setName] = useState(property?.name ?? '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    property?.property_type ?? 'apartment',
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
  const [rentCurrency, setRentCurrency] = useState(
    property?.rent_currency ?? 'VND',
  );
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
  const [amenities, setAmenities] = useState<AmenityValue[]>(() =>
    furnishingsToAmenityValues(property?.furnishings),
  );

  const safeActiveIndex = Math.min(activeRoomIndex, Math.max(rooms.length - 1, 0));
  const activeRoom = rooms[safeActiveIndex] ?? rooms[0];
  const images = activeRoom?.images ?? [];

  useEffect(() => {
    return () => {
      setRooms((prev) => {
        prev.forEach((room) => {
          room.images.forEach((image) => URL.revokeObjectURL(image.url));
        });
        return prev;
      });
    };
  }, []);

  function updateActiveRoom(patch: Partial<RoomDraft>) {
    setRooms((prev) =>
      prev.map((room, index) =>
        index === safeActiveIndex ? { ...room, ...patch } : room,
      ),
    );
  }

  function addRoom() {
    const nextIndex = rooms.length;
    setRooms((prev) => [...prev, createEmptyRoomDraft()]);
    setActiveRoomIndex(nextIndex);
    setImageError('');
  }

  function removeActiveRoom() {
    if (rooms.length <= 1) return;
    const removeIndex = safeActiveIndex;
    setRooms((prev) => {
      const removed = prev[removeIndex];
      removed?.images.forEach((image) => URL.revokeObjectURL(image.url));
      return prev.filter((_, index) => index !== removeIndex);
    });
    setActiveRoomIndex((current) =>
      Math.max(0, Math.min(current, rooms.length - 2)),
    );
    setImageError('');
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, item);
    updateActiveRoom({ images: copy });
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !activeRoom) {
      return;
    }

    setImageError('');

    const incoming = Array.from(fileList);
    const nextImages = [...images];
    const rejectionMessages: string[] = [];
    const existingCount =
      (activeRoom.id
        ? property?.rooms?.find((room) => room.id === activeRoom.id)?.images
            ?.length
        : undefined) ??
      (safeActiveIndex === 0 ? (property?.images.length ?? 0) : 0);

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

    updateActiveRoom({ images: nextImages });

    if (rejectionMessages.length > 0) {
      setImageError(rejectionMessages[0]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeImage(id: string) {
    const target = images.find((image) => image.id === id);
    if (target) {
      URL.revokeObjectURL(target.url);
    }
    updateActiveRoom({ images: images.filter((image) => image.id !== id) });
    setImageError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setImageError('');
    setSubmitting(true);

    try {
      const primaryRoom = rooms[0];
      const basePayload: UpdatePropertyPayload = {
        name:
          name.trim() ||
          [addressLine1.trim(), location.street, location.ward, location.district]
            .filter(Boolean)
            .join(', ') ||
          'Untitled property',
        property_type: propertyType,
        status: primaryRoom?.status ?? 'available',
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
        description: primaryRoom?.description.trim() || null,
        internal_notes: internalNotes.trim() || null,
        zalo_group_link: zaloGroupLink.trim() || null,
        fee_electricity: normalizeFeeAmount(feeElectricity),
        fee_water: normalizeFeeAmount(feeWater),
        fee_water_type: normalizeFeeAmount(feeWater) ? feeWaterType : null,
        fee_motorbike: normalizeFeeAmount(feeMotorbike),
        fee_car: normalizeFeeAmount(feeCar),
        fee_wifi: normalizeFeeAmount(feeWifi),
        fee_management: normalizeFeeAmount(feeManagement),
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

      const upserted = await upsertPropertyFurnishings(propertyId, {
        amenities,
        rooms: rooms.map((room) => {
          const roomArea = parseOptionalNumber(room.areaSqm);
          return {
            id: room.id,
            name: room.name.trim() || null,
            room_type: room.roomType.trim() || null,
            floor: room.floor.trim() || null,
            area_sqm:
              roomArea !== undefined && roomArea > 0 ? roomArea : null,
            rent_amount: parseOptionalNumber(room.rentAmount) ?? null,
            rent_currency: rentCurrency.trim() || 'VND',
            status: room.status,
            holding_deposit: parseOptionalNumber(room.holdingDeposit) ?? null,
            deposit_months: parseOptionalInt(room.depositMonths) ?? null,
            bedrooms: parseOptionalInt(room.bedrooms) ?? null,
            bathrooms: parseOptionalNumber(room.bathrooms) ?? null,
            description: room.description.trim() || null,
            furnishings: room.furnishings,
          };
        }),
      });

      // Upload images for each room draft using the matching saved room id
      // (same order as the rooms[] payload).
      for (let index = 0; index < rooms.length; index += 1) {
        const draft = rooms[index];
        const savedRoom = upserted.rooms[index];
        if (!savedRoom || draft.images.length === 0) continue;

        await uploadRoomImages(
          propertyId,
          savedRoom.id,
          draft.images.map((image) => image.file),
          0,
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
  const rentPreview = parseOptionalNumber(activeRoom?.rentAmount ?? '');
  const existingRoomImages = activeRoom?.id
    ? (property?.rooms?.find((room) => room.id === activeRoom.id)?.images ?? [])
    : [];

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#f3f4f6] bg-white px-4 py-3 sm:px-6">
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

      <form
        id="property-form"
        onSubmit={handleSubmit}
        className="w-full space-y-10 px-4 pt-8 pb-16 sm:px-8 lg:px-10"
      >
        {/* ── Property (building) ─────────────────────────────────────── */}
        <div className="space-y-8">
          <GroupBanner
            title={t('form.groupProperty')}
            description={t('form.groupPropertyHint')}
          />

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
            </div>
          </section>

          <section>
            <SectionHeading number={2} title={t('form.sectionAmenities')} />
            <p className="mb-3 text-xs text-[#9ca3af]">
              {t('form.amenitiesHint')}
            </p>
            <CheckboxGrid
              options={AMENITY_VALUES}
              value={amenities}
              onChange={setAmenities}
              labelFor={(option) => t(AMENITY_LABEL_KEYS[option])}
            />
          </section>

          <section>
            <SectionHeading number={3} title={t('form.sectionBuildingFees')} />
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {/* ── Room (unit) ─────────────────────────────────────────────── */}
        <div className="space-y-8 border-t border-[#e8e4dc] pt-10">
          <GroupBanner
            title={t('form.groupRoom')}
            description={t('form.groupRoomHint')}
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {rooms.map((room, index) => {
                const label =
                  room.name.trim() ||
                  t('form.roomTab', { n: index + 1 });
                const isActive = index === safeActiveIndex;
                return (
                  <button
                    key={room.key}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setActiveRoomIndex(index);
                      setImageError('');
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#1e4636] text-white'
                        : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={addRoom}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#1e4636]/40 px-3 py-1.5 text-sm font-medium text-[#1e4636] transition hover:border-[#1e4636] hover:bg-[#f3f7f5]"
            >
              <span aria-hidden="true" className="text-base leading-none">
                +
              </span>
              {t('form.addRoom')}
            </button>
            {rooms.length > 1 ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={removeActiveRoom}
                className="ml-auto text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                {t('form.removeRoom')}
              </button>
            ) : null}
          </div>

          <section>
            <SectionHeading number={4} title={t('form.sectionBasic')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="room_name" className={labelClassName}>
                  {t('form.roomName')}
                </label>
                <input
                  id="room_name"
                  value={activeRoom?.name ?? ''}
                  onChange={(e) => updateActiveRoom({ name: e.target.value })}
                  className={inputClassName}
                  placeholder={t('form.roomNamePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="room_type" className={labelClassName}>
                  {t('form.roomType')}
                </label>
                <select
                  id="room_type"
                  value={activeRoom?.roomType ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({
                      roomType:
                        e.target.value === ''
                          ? ''
                          : (e.target.value as RoomTypeValue),
                    })
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
                  value={activeRoom?.floor ?? ''}
                  onChange={(e) => updateActiveRoom({ floor: e.target.value })}
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
                  value={activeRoom?.areaSqm ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({ areaSqm: e.target.value })
                  }
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
                    value={activeRoom?.rentAmount ?? ''}
                    onChange={(e) =>
                      updateActiveRoom({
                        rentAmount: formatCurrencyInput(e.target.value),
                      })
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
              <div className="sm:col-span-2">
                <span className={labelClassName}>{t('form.status')}</span>
                <div className="mt-1 flex flex-wrap gap-5">
                  {(['available', 'rented'] as PropertyStatus[]).map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 text-sm text-[#1a1a1a]"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => updateActiveRoom({ status: item })}
                    >
                      <input
                        type="radio"
                        name={`status-${activeRoom?.key ?? 'room'}`}
                        checked={activeRoom?.status === item}
                        readOnly
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
                    activeRoom?.status === 'available' ||
                    activeRoom?.status === 'rented'
                      ? ''
                      : (activeRoom?.status ?? '')
                  }
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next) {
                      updateActiveRoom({ status: next as PropertyStatus });
                    }
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
          </section>

          <section>
            <SectionHeading number={5} title={t('form.sectionRoomDetails')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="holding_deposit" className={labelClassName}>
                  {t('form.holdingDeposit')}
                </label>
                <div className="relative">
                  <input
                    id="holding_deposit"
                    type="text"
                    inputMode="decimal"
                    value={activeRoom?.holdingDeposit ?? ''}
                    onChange={(e) =>
                      updateActiveRoom({
                        holdingDeposit: formatCurrencyInput(e.target.value),
                      })
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
                  value={activeRoom?.depositMonths ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({ depositMonths: e.target.value })
                  }
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
                  value={activeRoom?.bedrooms ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({ bedrooms: e.target.value })
                  }
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
                  value={activeRoom?.bathrooms ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({ bathrooms: e.target.value })
                  }
                  className={smallInputClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className={labelClassName}>
                  {t('form.notes')}
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={activeRoom?.description ?? ''}
                  onChange={(e) =>
                    updateActiveRoom({ description: e.target.value })
                  }
                  className={`${inputClassName} h-auto resize-none py-2`}
                  placeholder={t('form.notesPlaceholder')}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading number={6} title={t('form.sectionFurniture')} />
            <p className="mb-3 text-xs text-[#9ca3af]">
              {t('form.furnitureHint')}
            </p>
            <CheckboxGrid
              options={FURNISHING_VALUES}
              value={activeRoom?.furnishings ?? []}
              onChange={(furnishings) => updateActiveRoom({ furnishings })}
              labelFor={(option) => t(FURNISHING_LABEL_KEYS[option])}
            />
          </section>

          <section>
            <SectionHeading number={7} title={t('form.sectionImages')} />
            <p className="mb-3 text-xs text-[#9ca3af]">
              {t('form.roomPhotosHint')}
            </p>
            {isEdit && existingRoomImages.length > 0 ? (
              <ul className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                {existingRoomImages.map((image, index) => (
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

            <div className="relative h-0 w-0 overflow-hidden">
              <input
                ref={fileInputRef}
                id="property_images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                tabIndex={-1}
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
            </div>
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
                  <span className="text-xs font-medium">
                    {t('form.uploadImages')}
                  </span>
                </label>
              </li>
            </ul>
            <p className="mt-2 text-xs text-[#9ca3af]">
              {t('form.imageOrderHint')}
            </p>
            {imageError ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {imageError}
              </div>
            ) : null}
          </section>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end pb-2">
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
  );
}
