'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import { isRoomTypeValue } from '@/src/lib/room-types';
import type {
  Property,
  PropertyFurnishings,
  PropertyUtilityBill,
  UtilityBillType,
} from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AMENITY_LABEL_KEYS } from './AmenityMultiSelect';
import { FURNISHING_LABEL_KEYS } from './FurnishingMultiSelect';
import PropertyImageLightbox from './PropertyImageLightbox';
import { ROOM_TYPE_LABEL_KEYS } from './RoomTypeSelect';

export interface PropertyListItemProps {
  property: Property;
  href?: string;
  className?: string;
}

const MAX_VISIBLE_TAGS = 6;

const AMENITY_FLAGS: Array<{
  key: keyof PropertyFurnishings;
  labelKey: TranslationKey;
}> = [
  { key: 'has_elevator', labelKey: AMENITY_LABEL_KEYS.elevator },
  { key: 'has_security_guard', labelKey: AMENITY_LABEL_KEYS.security_24_7 },
  { key: 'has_bike_parking', labelKey: AMENITY_LABEL_KEYS.bike_parking },
  { key: 'has_car_parking', labelKey: AMENITY_LABEL_KEYS.car_parking },
  { key: 'pets_ok', labelKey: AMENITY_LABEL_KEYS.pets_ok },
  { key: 'foreigners_ok', labelKey: AMENITY_LABEL_KEYS.foreigners_ok },
  {
    key: 'has_cleaning_service',
    labelKey: AMENITY_LABEL_KEYS.cleaning_service,
  },
  {
    key: 'has_fixed_electricity',
    labelKey: AMENITY_LABEL_KEYS.fixed_electricity,
  },
  {
    key: 'has_solar_hot_water',
    labelKey: AMENITY_LABEL_KEYS.solar_hot_water,
  },
];

const FURNISHING_FLAGS: Array<{
  key: keyof PropertyFurnishings;
  labelKey: TranslationKey;
}> = [
  { key: 'has_air_conditioner', labelKey: FURNISHING_LABEL_KEYS.air_conditioner },
  { key: 'has_fridge', labelKey: FURNISHING_LABEL_KEYS.fridge },
  { key: 'has_mattress', labelKey: FURNISHING_LABEL_KEYS.mattress },
  { key: 'has_hot_water', labelKey: FURNISHING_LABEL_KEYS.hot_water },
  { key: 'has_bed', labelKey: FURNISHING_LABEL_KEYS.bed },
  { key: 'has_wardrobe', labelKey: FURNISHING_LABEL_KEYS.wardrobe },
  { key: 'has_tv', labelKey: FURNISHING_LABEL_KEYS.tv },
  { key: 'has_pillow', labelKey: FURNISHING_LABEL_KEYS.pillow },
  { key: 'has_blanket', labelKey: FURNISHING_LABEL_KEYS.blanket },
  { key: 'has_balcony', labelKey: FURNISHING_LABEL_KEYS.balcony },
  { key: 'has_window', labelKey: FURNISHING_LABEL_KEYS.window },
  { key: 'has_loft', labelKey: FURNISHING_LABEL_KEYS.loft },
];

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
  href,
  className,
}: PropertyListItemProps) {
  const t = useTranslations();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = property.images ?? [];
  const imageUrl = images[0]?.public_url;
  const extraImageCount = Math.max(images.length - 1, 0);
  const address = formatListAddress(property);
  const rent = formatVnd(property.rent_amount);

  const roomTypeLabel =
    property.room_type && isRoomTypeValue(property.room_type)
      ? t(ROOM_TYPE_LABEL_KEYS[property.room_type])
      : property.room_type;

  const electricity = latestBillByType(property.utility_bills ?? [], 'electricity');
  const water = latestBillByType(property.utility_bills ?? [], 'water');
  const management = latestBillByType(property.utility_bills ?? [], 'management');
  const includedBadge =
    management?.status === 'waived' ||
    management?.status === 'no_payment_needed' ||
    electricity?.status === 'waived' ||
    water?.status === 'waived';

  const { amenityTags, furnishingTags } = useMemo(() => {
    const furnishings = property.furnishings;
    if (!furnishings) {
      return { amenityTags: [] as string[], furnishingTags: [] as string[] };
    }

    const amenities: string[] = [];
    for (const flag of AMENITY_FLAGS) {
      if (furnishings[flag.key] === true) {
        amenities.push(t(flag.labelKey));
      }
    }
    if (furnishings.washing_machine === 'shared') {
      amenities.push(t(AMENITY_LABEL_KEYS.shared_washing_machine));
    }
    if (furnishings.washing_machine === 'private') {
      amenities.push(t(AMENITY_LABEL_KEYS.private_washing_machine));
    }

    const furniture: string[] = [];
    for (const flag of FURNISHING_FLAGS) {
      if (furnishings[flag.key] === true) {
        furniture.push(t(flag.labelKey));
      }
    }

    return { amenityTags: amenities, furnishingTags: furniture };
  }, [property.furnishings, t]);

  const allTags = [
    ...amenityTags.map((label) => ({ label, tone: 'amenity' as const })),
    ...furnishingTags.map((label) => ({ label, tone: 'furnishing' as const })),
  ];
  const visibleTags = allTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = Math.max(allTags.length - visibleTags.length, 0);

  const detailHref = href ?? `/properties/${property.id}`;

  async function handleCopy() {
    const lines = [
      property.name,
      address,
      rent ? `${rent} / ${t('list.perMonth')}` : null,
      roomTypeLabel,
      property.description,
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
        className={`overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white shadow-sm ${className ?? ''}`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative h-52 w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9] md:h-auto md:min-h-[220px] md:w-56 lg:w-64">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={property.name}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
              />
            ) : null}

            {extraImageCount > 0 ? (
              <button
                type="button"
                onClick={openGallery}
                className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                {t('list.morePhotos', { count: String(extraImageCount) })}
              </button>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  property.status === 'available'
                    ? 'bg-[#e8f3ed] text-[#1e4636]'
                    : property.status === 'rented'
                      ? 'bg-[#dbeafe] text-[#1d4ed8]'
                      : 'bg-[#f3f4f6] text-[#6b7280]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    property.status === 'available'
                      ? 'bg-[#1e4636]'
                      : property.status === 'rented'
                        ? 'bg-[#1d4ed8]'
                        : 'bg-[#9ca3af]'
                  }`}
                />
                {t(`status.${property.status}` as TranslationKey)}
              </span>
              {roomTypeLabel ? (
                <span className="text-sm font-medium text-[#6b7280]">
                  {roomTypeLabel}
                </span>
              ) : null}
            </div>

            {rent ? (
              <p className="text-xl font-bold tracking-tight text-[#1a1a1a] sm:text-2xl">
                {rent}
                <span className="ml-1 text-sm font-medium text-[#6b7280]">
                  /{t('list.perMonth')}
                </span>
              </p>
            ) : null}

            <p className="text-base font-semibold leading-snug text-[#1a1a1a]">
              {address || property.name}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6b7280]">
              {property.floor ? (
                <span>
                  {t('list.floor', { floor: property.floor })}
                </span>
              ) : null}
              {property.area_sqm != null ? (
                <span>
                  {t('list.area', {
                    area: String(property.area_sqm),
                  })}
                </span>
              ) : null}
              {property.holding_deposit != null ? (
                <span>
                  {t('list.holdingDeposit', {
                    amount: formatVnd(property.holding_deposit) ?? '',
                  })}
                </span>
              ) : property.deposit_months != null ? (
                <span>
                  {t('list.depositMonths', {
                    count: String(property.deposit_months),
                  })}
                </span>
              ) : null}
            </div>

            {(electricity || water || management || includedBadge) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6b7280]">
                {electricity ? (
                  <span>
                    {t('list.electricity', {
                      amount: formatVnd(electricity.amount) ?? '',
                    })}
                  </span>
                ) : null}
                {water ? (
                  <span>
                    {t('list.water', {
                      amount: formatVnd(water.amount) ?? '',
                    })}
                  </span>
                ) : null}
                {management ? (
                  <span>
                    {t('list.management', {
                      amount: formatVnd(management.amount) ?? '',
                    })}
                  </span>
                ) : null}
                {includedBadge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3ed] px-2 py-0.5 text-[11px] font-semibold text-[#1e4636]">
                    <CheckIcon />
                    {t('list.included')}
                  </span>
                ) : null}
              </div>
            )}

            {visibleTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visibleTags.map((tag) => (
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
                {hiddenTagCount > 0 ? (
                  <span className="inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
                    +{hiddenTagCount}
                  </span>
                ) : null}
              </div>
            ) : null}

            {property.description ? (
              <p className="line-clamp-1 text-sm text-[#6b7280]">
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
            </div>
          </div>
        </div>
      </article>

      {lightboxOpen ? (
        <PropertyImageLightbox
          images={images}
          activeIndex={lightboxIndex}
          propertyName={property.name}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
