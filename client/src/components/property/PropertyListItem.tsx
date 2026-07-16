'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import { FURNISHING_VALUES } from '@/src/lib/furnishings';
import { FURNISHING_COLUMN_BY_VALUE } from '@/src/lib/furnishings-selection';
import { isRoomTypeValue } from '@/src/lib/room-types';
import type {
  Property,
  PropertyFurnishings,
  PropertyUtilityBill,
  Room,
  UtilityBillType,
} from '@/src/types/property';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AMENITY_LABEL_KEYS } from './AmenityMultiSelect';
import { FURNISHING_LABEL_KEYS } from './FurnishingMultiSelect';
import PropertyImageLightbox from './PropertyImageLightbox';
import PropertyImageSlideshow, {
  collectPropertySlideshowImages,
  type SlideshowImage,
} from './PropertyImageSlideshow';
import { formatRent, formatRentRange, statusStyles } from './format';
import { ROOM_TYPE_LABEL_KEYS } from './RoomTypeSelect';

export interface PropertyListItemProps {
  property: Property;
  /** When set, show this room only (filtered room listing). */
  focusedRoom?: Room | null;
  href?: string;
  className?: string;
}

const AMENITY_FLAGS: Array<{
  key: keyof PropertyFurnishings;
  labelKey: TranslationKey;
}> = [
  { key: 'has_elevator', labelKey: AMENITY_LABEL_KEYS.elevator },
  { key: 'has_security_guard', labelKey: AMENITY_LABEL_KEYS.security_guard },
  { key: 'has_car_parking', labelKey: AMENITY_LABEL_KEYS.car_parking },
  {
    key: 'has_bike_parking',
    labelKey: AMENITY_LABEL_KEYS.motorbike_parking,
  },
  { key: 'has_ev_parking', labelKey: AMENITY_LABEL_KEYS.ev_parking },
  { key: 'pets_ok', labelKey: AMENITY_LABEL_KEYS.pet_friendly },
  { key: 'foreigners_ok', labelKey: AMENITY_LABEL_KEYS.foreigner_friendly },
  {
    key: 'has_cleaning_service',
    labelKey: AMENITY_LABEL_KEYS.cleaning_service,
  },
];

const FURNISHING_FLAGS: Array<{
  key: keyof PropertyFurnishings;
  labelKey: TranslationKey;
}> = [
  {
    key: 'has_air_conditioner',
    labelKey: FURNISHING_LABEL_KEYS.air_conditioner,
  },
  { key: 'has_fridge', labelKey: FURNISHING_LABEL_KEYS.fridge },
  { key: 'has_wardrobe', labelKey: FURNISHING_LABEL_KEYS.wardrobe },
  {
    key: 'has_upper_kitchen_cabinet',
    labelKey: FURNISHING_LABEL_KEYS.upper_kitchen_cabinet,
  },
  {
    key: 'has_lower_kitchen_cabinet',
    labelKey: FURNISHING_LABEL_KEYS.lower_kitchen_cabinet,
  },
  {
    key: 'has_kitchen_counter',
    labelKey: FURNISHING_LABEL_KEYS.kitchen_counter,
  },
  { key: 'has_mattress', labelKey: FURNISHING_LABEL_KEYS.mattress },
  { key: 'has_bed', labelKey: FURNISHING_LABEL_KEYS.bed },
  { key: 'has_shoe_cabinet', labelKey: FURNISHING_LABEL_KEYS.shoe_cabinet },
  {
    key: 'has_window_outdoor_view',
    labelKey: FURNISHING_LABEL_KEYS.window_outdoor_view,
  },
  {
    key: 'has_window_corridor',
    labelKey: FURNISHING_LABEL_KEYS.window_corridor,
  },
  {
    key: 'has_window_air_well',
    labelKey: FURNISHING_LABEL_KEYS.window_air_well,
  },
  { key: 'has_balcony', labelKey: FURNISHING_LABEL_KEYS.balcony },
  {
    key: 'has_ventilation_window',
    labelKey: FURNISHING_LABEL_KEYS.ventilation_window,
  },
  { key: 'has_dining_table', labelKey: FURNISHING_LABEL_KEYS.dining_table },
  { key: 'has_desk', labelKey: FURNISHING_LABEL_KEYS.desk },
  {
    key: 'has_dressing_table',
    labelKey: FURNISHING_LABEL_KEYS.dressing_table,
  },
  { key: 'has_sofa', labelKey: FURNISHING_LABEL_KEYS.sofa },
  { key: 'has_tv', labelKey: FURNISHING_LABEL_KEYS.tv },
  { key: 'has_range_hood', labelKey: FURNISHING_LABEL_KEYS.range_hood },
  { key: 'has_hot_water', labelKey: FURNISHING_LABEL_KEYS.water_heater },
];

function roomFurnitureLabels(
  room: Room,
  t: (key: TranslationKey) => string,
): string[] {
  return FURNISHING_VALUES.flatMap((value) => {
    const column = FURNISHING_COLUMN_BY_VALUE[value];
    if (room[column as keyof Room] !== true) return [];
    return [t(FURNISHING_LABEL_KEYS[value])];
  });
}

function roomImagesForSlideshow(room: Room | null): SlideshowImage[] {
  if (!room?.images?.length) return [];
  return room.images.map((image) => ({
    id: image.id,
    public_url: image.public_url,
  }));
}

function formatVnd(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

function formatListAddress(property: Property): string {
  return [
    property.address_line1,
    property.ward,
    property.district,
  ]
    .filter(Boolean)
    .join(', ');
}

function latestBillByType(
  bills: PropertyUtilityBill[],
  billType: UtilityBillType,
): PropertyUtilityBill | null {
  const matches = bills.filter((bill) => bill.bill_type === billType);
  if (matches.length === 0) return null;
  return matches.sort(
    (a, b) =>
      new Date(b.billing_period_end).getTime() -
      new Date(a.billing_period_end).getTime(),
  )[0];
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 15V5a2 2 0 012-2h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 15l4.5-4.5a2 2 0 012.8 0L17 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3c-4.97 0-9 3.58-9 8 0 2.52 1.3 4.77 3.35 6.28L5 21l4.12-1.65C10.05 19.78 11 20 12 20c4.97 0 9-3.58 9-8s-4.03-9-9-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5h7M8.5 13.5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export default function PropertyListItem({
  property,
  focusedRoom = null,
  href,
  className,
}: PropertyListItemProps) {
  const t = useTranslations();
  const allRooms = property.rooms ?? [];
  const rooms = focusedRoom ? [focusedRoom] : allRooms;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  useEffect(() => {
    setActiveRoomIndex(0);
  }, [property.id, focusedRoom?.id]);

  const safeRoomIndex = Math.min(
    activeRoomIndex,
    Math.max(rooms.length - 1, 0),
  );
  const selectedRoom = rooms[safeRoomIndex] ?? null;
  const hasMultipleRooms = !focusedRoom && rooms.length > 1;

  const images = useMemo(() => {
    const roomSlides = roomImagesForSlideshow(selectedRoom);
    if (roomSlides.length > 0) return roomSlides;
    if (hasMultipleRooms) {
      return (property.images ?? []).map((image) => ({
        id: image.id,
        public_url: image.public_url,
      }));
    }
    return collectPropertySlideshowImages(property);
  }, [property, selectedRoom, hasMultipleRooms]);

  const extraImageCount = Math.max(images.length - 1, 0);
  const address = formatListAddress(property);

  const rentRange = formatRentRange(
    rooms,
    property.rent_amount,
    property.rent_currency,
  );
  const roomRent = selectedRoom
    ? formatRent(
        selectedRoom.rent_amount,
        selectedRoom.rent_currency || property.rent_currency,
      )
    : null;
  const rent = hasMultipleRooms ? roomRent : rentRange ?? roomRent;

  const roomTypeLabelValue = (() => {
    const type = selectedRoom?.room_type || property.room_type;
    if (!type) return null;
    if (isRoomTypeValue(type)) return t(ROOM_TYPE_LABEL_KEYS[type]);
    return type;
  })();

  const displayStatus = selectedRoom?.status ?? property.status;
  const displayFloor = selectedRoom?.floor ?? property.floor;
  const displayArea = selectedRoom?.area_sqm ?? property.area_sqm;
  const displayBedrooms = selectedRoom?.bedrooms ?? property.bedrooms;
  const displayBathrooms = selectedRoom?.bathrooms ?? property.bathrooms;
  const displayHoldingDeposit =
    selectedRoom?.holding_deposit ?? property.holding_deposit;
  const displayDepositMonths =
    selectedRoom?.deposit_months ?? property.deposit_months;

  const electricityBill = latestBillByType(
    property.utility_bills ?? [],
    'electricity',
  );
  const waterBill = latestBillByType(property.utility_bills ?? [], 'water');
  const managementBill = latestBillByType(
    property.utility_bills ?? [],
    'management',
  );
  const includedBadge =
    managementBill?.status === 'waived' ||
    managementBill?.status === 'no_payment_needed' ||
    electricityBill?.status === 'waived' ||
    waterBill?.status === 'waived';

  const waterFeeLabel = property.fee_water
    ? property.fee_water_type === 'fixed'
      ? `${property.fee_water} (${t('form.feeWaterFixed')})`
      : property.fee_water_type === 'per_m3'
        ? `${property.fee_water} (${t('form.feeWaterPerM3')})`
        : property.fee_water
    : null;

  const feeRows = [
    property.fee_electricity
      ? t('list.electricity', { amount: property.fee_electricity })
      : electricityBill
        ? t('list.electricity', {
            amount: formatVnd(electricityBill.amount) ?? '',
          })
        : null,
    waterFeeLabel
      ? t('list.water', { amount: waterFeeLabel })
      : waterBill
        ? t('list.water', { amount: formatVnd(waterBill.amount) ?? '' })
        : null,
    property.fee_motorbike
      ? t('list.motorbike', { amount: property.fee_motorbike })
      : null,
    property.fee_car ? t('list.car', { amount: property.fee_car }) : null,
    property.fee_wifi ? t('list.wifi', { amount: property.fee_wifi }) : null,
    property.fee_management
      ? t('list.management', { amount: property.fee_management })
      : managementBill
        ? t('list.management', {
            amount: formatVnd(managementBill.amount) ?? '',
          })
        : null,
  ].filter(Boolean) as string[];

  const amenityTags = useMemo(() => {
    const furnishings = property.furnishings;
    if (!furnishings) return [] as string[];

    const amenities: string[] = [];
    for (const flag of AMENITY_FLAGS) {
      if (furnishings[flag.key] === true) {
        amenities.push(t(flag.labelKey));
      }
    }
    return amenities;
  }, [property.furnishings, t]);

  const furnishingTags = useMemo(() => {
    if (selectedRoom) {
      return roomFurnitureLabels(selectedRoom, t);
    }
    const furnishings = property.furnishings;
    if (!furnishings) return [] as string[];

    const furniture: string[] = [];
    for (const flag of FURNISHING_FLAGS) {
      if (furnishings[flag.key] === true) {
        furniture.push(t(flag.labelKey));
      }
    }
    return furniture;
  }, [selectedRoom, property.furnishings, t]);

  const allTags = [
    ...amenityTags.map((label) => ({ label, tone: 'amenity' as const })),
    ...furnishingTags.map((label) => ({ label, tone: 'furnishing' as const })),
  ];

  const detailHref = href ?? `/properties/${property.id}`;

  async function handleCopy() {
    const lines = [
      property.name,
      address,
      rent ? `${rent} / ${t('list.perMonth')}` : null,
      roomTypeLabelValue,
      displayFloor ? t('list.floor', { floor: displayFloor }) : null,
      displayArea != null
        ? t('list.area', { area: String(displayArea) })
        : null,
      displayBedrooms != null
        ? t('list.bedrooms', { count: String(displayBedrooms) })
        : null,
      displayBathrooms != null
        ? t('list.bathrooms', { count: String(displayBathrooms) })
        : null,
      ...feeRows,
      ...allTags.map((tag) => tag.label),
      property.description,
      property.zalo_group_link,
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function openGallery() {
    if (images.length === 0) return;
    setLightboxIndex(0);
    setLightboxOpen(true);
  }

  return (
    <>
      <article
        className={`flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white shadow-sm ${className ?? ''}`}
      >
        <div className="flex h-full flex-col">
          <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9]">
            <PropertyImageSlideshow
              images={images}
              alt={selectedRoom?.name?.trim() || property.name}
              sizes="(max-width: 640px) 100vw, 50vw"
              showDots={false}
            />

            {extraImageCount > 0 ? (
              <button
                type="button"
                onClick={openGallery}
                className="absolute bottom-3 right-3 z-10 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                {t('list.morePhotos', { count: String(extraImageCount) })}
              </button>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  displayStatus === 'available'
                    ? 'bg-[#e8f3ed] text-[#1e4636]'
                    : displayStatus === 'rented'
                      ? 'bg-[#dbeafe] text-[#1d4ed8]'
                      : 'bg-[#f3f4f6] text-[#6b7280]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    displayStatus === 'available'
                      ? 'bg-[#1e4636]'
                      : displayStatus === 'rented'
                        ? 'bg-[#1d4ed8]'
                        : 'bg-[#9ca3af]'
                  }`}
                />
                {t(`status.${displayStatus}` as TranslationKey)}
              </span>
              <span className="text-sm font-medium text-[#6b7280]">
                {t(`type.${property.property_type}` as TranslationKey)}
              </span>
              {roomTypeLabelValue ? (
                <span className="text-sm font-medium text-[#6b7280]">
                  {roomTypeLabelValue}
                </span>
              ) : null}
            </div>

            {hasMultipleRooms ? (
              <nav
                className="flex flex-wrap gap-1.5"
                aria-label={t('detail.rooms')}
              >
                {rooms.map((room, index) => {
                  const label =
                    room.name?.trim() || t('form.roomTab', { n: index + 1 });
                  const isActive = index === safeRoomIndex;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setActiveRoomIndex(index)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#1e4636] text-white'
                          : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : statusStyles(room.status)
                        }`}
                      >
                        {t(`status.${room.status}` as TranslationKey)}
                      </span>
                    </button>
                  );
                })}
              </nav>
            ) : null}

            {rent ? (
              <p className="text-xl font-bold tracking-tight text-[#1a1a1a] sm:text-2xl">
                {rent}
                <span className="ml-1 text-sm font-medium text-[#6b7280]">
                  /{t('list.perMonth')}
                </span>
              </p>
            ) : null}

            {hasMultipleRooms && rentRange && rentRange !== rent ? (
              <p className="text-xs text-[#6b7280]">
                {t('detail.rooms')}: {rentRange}
              </p>
            ) : null}

            <div>
              <p className="text-base font-semibold leading-snug text-[#1a1a1a]">
                {property.name}
              </p>
              {focusedRoom ? (
                <p className="mt-0.5 text-sm font-medium text-[#1e4636]">
                  {focusedRoom.name?.trim() ||
                    t('form.roomTab', { n: 1 })}
                </p>
              ) : null}
              {address ? (
                <p className="mt-1 text-sm text-[#6b7280]">{address}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6b7280]">
              {displayFloor ? (
                <span>{t('list.floor', { floor: displayFloor })}</span>
              ) : null}
              {displayArea != null ? (
                <span>
                  {t('list.area', {
                    area: String(displayArea),
                  })}
                </span>
              ) : null}
              {displayBedrooms != null ? (
                <span>
                  {t('list.bedrooms', {
                    count: String(displayBedrooms),
                  })}
                </span>
              ) : null}
              {displayBathrooms != null ? (
                <span>
                  {t('list.bathrooms', {
                    count: String(displayBathrooms),
                  })}
                </span>
              ) : null}
              {displayHoldingDeposit != null ? (
                <span>
                  {t('list.holdingDeposit', {
                    amount: formatVnd(displayHoldingDeposit) ?? '',
                  })}
                </span>
              ) : null}
              {displayDepositMonths != null ? (
                <span>
                  {t('list.depositMonths', {
                    count: String(displayDepositMonths),
                  })}
                </span>
              ) : null}
            </div>

            {(feeRows.length > 0 || includedBadge) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6b7280]">
                {feeRows.map((row) => (
                  <span key={row}>{row}</span>
                ))}
                {includedBadge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3ed] px-2 py-0.5 text-[11px] font-semibold text-[#1e4636]">
                    <CheckIcon />
                    {t('list.included')}
                  </span>
                ) : null}
              </div>
            )}

            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <span
                    key={`${tag.tone}-${tag.label}`}
                    className={
                      tag.tone === 'amenity'
                        ? 'inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium text-[#4b5563]'
                        : 'inline-flex rounded-full bg-[#e8f1fb] px-2.5 py-1 text-[11px] font-medium text-[#1d4ed8]'
                    }
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            ) : null}

            {selectedRoom?.description ? (
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-[#6b7280]">
                {selectedRoom.description}
              </p>
            ) : property.description ? (
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-[#6b7280]">
                {property.description}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <Link
                href={detailHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#333]"
              >
                <EyeIcon />
                {t('list.viewEdit')}
              </Link>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:bg-[#f9fafb]"
              >
                <CopyIcon />
                {copied ? t('list.copied') : t('list.copyInfo')}
              </button>
              <button
                type="button"
                onClick={openGallery}
                disabled={images.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <GalleryIcon />
                {t('list.photoGallery')}
              </button>
              {property.zalo_group_link ? (
                <a
                  href={property.zalo_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0068ff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0056d6]"
                >
                  <ZaloIcon />
                  {t('list.zaloGroup')}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      {lightboxOpen ? (
        <PropertyImageLightbox
          images={images}
          activeIndex={lightboxIndex}
          propertyName={selectedRoom?.name?.trim() || property.name}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
