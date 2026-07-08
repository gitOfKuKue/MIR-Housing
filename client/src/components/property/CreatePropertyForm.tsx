'use client';

import {
  createProperty,
  uploadPropertyImages,
  type CreatePropertyPayload,
} from '@/src/lib/api';
import type {
  DryingAreaType,
  MainGateLockType,
  ParkingType,
  PropertyStatus,
  PropertyType,
  ToiletType,
} from '@/src/types/property';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

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

export default function CreatePropertyForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);

  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [status, setStatus] = useState<PropertyStatus>('available');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Ho Chi Minh City');
  const [province, setProvince] = useState('Ho Chi Minh');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('VN');
  const [rentAmount, setRentAmount] = useState('');
  const [rentCurrency, setRentCurrency] = useState('VND');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqm, setAreaSqm] = useState('');
  const [roomType, setRoomType] = useState('');
  const [toiletType, setToiletType] = useState<ToiletType | ''>('');
  const [parkingType, setParkingType] = useState<ParkingType | ''>('');
  const [mainGateLock, setMainGateLock] = useState<MainGateLockType | ''>('');
  const [maxOccupants, setMaxOccupants] = useState('');
  const [maxBikes, setMaxBikes] = useState('');
  const [floor, setFloor] = useState('');
  const [dryingArea, setDryingArea] = useState<DryingAreaType | ''>('');
  const [depositMonths, setDepositMonths] = useState('');
  const [holdingDeposit, setHoldingDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

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

    for (const file of incoming) {
      if (nextImages.length >= MAX_IMAGE_COUNT) {
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
      const payload: CreatePropertyPayload = {
        name: name.trim(),
        property_type: propertyType,
        status,
        address_line1: addressLine1.trim(),
        city: city.trim(),
        province: province.trim(),
        country: country.trim() || 'VN',
        rent_currency: rentCurrency.trim() || 'VND',
      };

      if (addressLine2.trim()) payload.address_line2 = addressLine2.trim();
      if (postalCode.trim()) payload.postal_code = postalCode.trim();
      if (roomType.trim()) payload.room_type = roomType.trim();
      if (floor.trim()) payload.floor = floor.trim();
      if (description.trim()) payload.description = description.trim();
      if (internalNotes.trim()) payload.internal_notes = internalNotes.trim();
      if (toiletType) payload.toilet_type = toiletType;
      if (parkingType) payload.parking_type = parkingType;
      if (mainGateLock) payload.main_gate_lock = mainGateLock;
      if (dryingArea) payload.drying_area = dryingArea;

      const rent = parseOptionalNumber(rentAmount);
      if (rent !== undefined) payload.rent_amount = rent;

      const beds = parseOptionalInt(bedrooms);
      if (beds !== undefined) payload.bedrooms = beds;

      const baths = parseOptionalNumber(bathrooms);
      if (baths !== undefined) payload.bathrooms = baths;

      const area = parseOptionalNumber(areaSqm);
      if (area !== undefined) payload.area_sqm = area;

      const occupants = parseOptionalInt(maxOccupants);
      if (occupants !== undefined) payload.max_occupants = occupants;

      const bikes = parseOptionalInt(maxBikes);
      if (bikes !== undefined) payload.max_bikes = bikes;

      const deposit = parseOptionalInt(depositMonths);
      if (deposit !== undefined) payload.deposit_months = deposit;

      const holding = parseOptionalNumber(holdingDeposit);
      if (holding !== undefined) payload.holding_deposit = holding;

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
        err instanceof Error ? err.message : 'Failed to create property',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <Link
        href="/properties"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] transition hover:text-[#1e4636]"
      >
        <BackIcon />
        Back to properties
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Create property</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Fill in the details below to add a new property listing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-[#e8e4dc] bg-white p-6 shadow-sm"
      >
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Basic info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClassName}>
                Name <span className="text-red-500">*</span>
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
                Property type
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
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className={labelClassName}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className={inputClassName}
              >
                {PROPERTY_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Images</h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Upload up to {MAX_IMAGE_COUNT} images (JPEG, PNG, or WebP). Max
                5 MB each.
              </p>
            </div>
            <p className="text-sm font-medium text-[#6b7280]">
              {images.length}/{MAX_IMAGE_COUNT} selected
            </p>
          </div>

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
                Click to select images
              </span>
              <span className="text-xs text-[#6b7280]">
                You can select multiple images at once
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
                        Cover
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
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Location</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address_line1" className={labelClassName}>
                Address line 1 <span className="text-red-500">*</span>
              </label>
              <input
                id="address_line1"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className={inputClassName}
                placeholder="Street address"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address_line2" className={labelClassName}>
                Address line 2
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
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="province" className={labelClassName}>
                Province <span className="text-red-500">*</span>
              </label>
              <input
                id="province"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="postal_code" className={labelClassName}>
                Postal code
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
                Country
              </label>
              <input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={2}
                className={inputClassName}
                placeholder="VN"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Rent &amp; size</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="rent_amount" className={labelClassName}>
                Rent amount
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
                Currency
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
                Area (sqm)
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
                Bedrooms
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
                Bathrooms
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
            Room info &amp; amenities
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="room_type" className={labelClassName}>
                Room type
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
                Floor
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
                Toilet
              </label>
              <select
                id="toilet_type"
                value={toiletType}
                onChange={(e) =>
                  setToiletType(e.target.value as ToiletType | '')
                }
                className={inputClassName}
              >
                <option value="">Not set</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="parking_type" className={labelClassName}>
                Parking
              </label>
              <select
                id="parking_type"
                value={parkingType}
                onChange={(e) =>
                  setParkingType(e.target.value as ParkingType | '')
                }
                className={inputClassName}
              >
                <option value="">Not set</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="main_gate_lock" className={labelClassName}>
                Main gate lock
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
                      ? item.charAt(0).toUpperCase() + item.slice(1)
                      : 'Not set'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="drying_area" className={labelClassName}>
                Drying area
              </label>
              <select
                id="drying_area"
                value={dryingArea}
                onChange={(e) =>
                  setDryingArea(e.target.value as DryingAreaType | '')
                }
                className={inputClassName}
              >
                <option value="">Not set</option>
                {PRIVATE_SHARED.filter(Boolean).map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="max_occupants" className={labelClassName}>
                Max occupants
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
                Max bikes
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
                Deposit (months)
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
                Holding deposit
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
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Notes</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label htmlFor="description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClassName}
                placeholder="Public-facing description"
              />
            </div>

            <div>
              <label htmlFor="internal_notes" className={labelClassName}>
                Internal notes
              </label>
              <textarea
                id="internal_notes"
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className={inputClassName}
                placeholder="Staff-only notes"
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
            href="/properties"
            className="inline-flex rounded-lg border border-[#e5e7eb] px-5 py-2.5 text-sm font-semibold text-[#4b5563] transition hover:border-[#1e4636] hover:text-[#1e4636]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating...' : 'Create property'}
          </button>
        </div>
      </form>
    </div>
  );
}
