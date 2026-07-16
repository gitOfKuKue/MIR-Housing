'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type { Property, Room } from '@/src/types/property';
import Link from 'next/link';
import { useMemo } from 'react';
import { formatRentRange, statusStyles } from './format';
import PropertyImageSlideshow, {
  collectPropertySlideshowImages,
} from './PropertyImageSlideshow';
import { AMENITY_LABEL_KEYS } from './AmenityMultiSelect';
import { FURNISHING_LABEL_KEYS } from './FurnishingMultiSelect';
import { FURNISHING_VALUES } from '@/src/lib/furnishings';
import { FURNISHING_COLUMN_BY_VALUE } from '@/src/lib/furnishings-selection';
import { isRoomTypeValue } from '@/src/lib/room-types';
import { ROOM_TYPE_LABEL_KEYS } from './RoomTypeSelect';

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    >
      <path
        d="M7 4h10a1 1 0 011 1v15.2a.8.8 0 01-1.24.67L12 17.3l-4.76 3.57A.8.8 0 016 20.2V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function formatCardAddress(property: Property): string {
  return [
    property.address_line1,
    property.street,
    property.ward,
    property.district,
  ]
    .filter(Boolean)
    .join(', ');
}

function primaryRoom(property: Property): Room | null {
  const rooms = property.rooms ?? [];
  if (rooms.length === 0) return null;
  return [...rooms].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )[0];
}

export interface PropertyCardProps {
  property: Property;
  imageUrl?: string;
  imageAlt?: string;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  className?: string;
}

export default function PropertyCard({
  property,
  imageUrl,
  imageAlt,
  actionLabel,
  href,
  onAction,
  bookmarked = false,
  onBookmark,
  className,
}: PropertyCardProps) {
  const t = useTranslations();
  const resolvedActionLabel = actionLabel ?? t('properties.viewDetails');
  const rent = formatRentRange(
    property.rooms ?? [],
    property.rent_amount,
    property.rent_currency,
  );
  const address = formatCardAddress(property);
  const rooms = property.rooms ?? [];
  const availableCount = rooms.filter(
    (room) => room.status === 'available',
  ).length;
  const room = primaryRoom(property);

  const slideshowImages = useMemo(() => {
    if (imageUrl) {
      return [{ id: 'override', public_url: imageUrl }];
    }
    return collectPropertySlideshowImages(property);
  }, [imageUrl, property]);

  const roomTypeLabel =
    (room?.room_type || property.room_type) &&
    isRoomTypeValue(room?.room_type || property.room_type || '')
      ? t(
          ROOM_TYPE_LABEL_KEYS[
            (room?.room_type || property.room_type) as keyof typeof ROOM_TYPE_LABEL_KEYS
          ],
        )
      : room?.room_type || property.room_type;

  const detailChips = [
    rooms.length > 0
      ? t('detail.roomsCount', { count: rooms.length })
      : null,
    rooms.length > 0
      ? t('detail.roomsAvailable', { count: availableCount })
      : null,
    roomTypeLabel,
    (room?.floor || property.floor)
      ? t('list.floor', { floor: room?.floor || property.floor || '' })
      : null,
    (room?.area_sqm ?? property.area_sqm) != null
      ? t('list.area', {
          area: String(room?.area_sqm ?? property.area_sqm),
        })
      : null,
    (room?.bedrooms ?? property.bedrooms) != null
      ? t('list.bedrooms', {
          count: String(room?.bedrooms ?? property.bedrooms),
        })
      : null,
    (room?.bathrooms ?? property.bathrooms) != null
      ? t('list.bathrooms', {
          count: String(room?.bathrooms ?? property.bathrooms),
        })
      : null,
  ].filter(Boolean) as string[];

  const featureTags = useMemo(() => {
    const furnishings = property.furnishings;
    if (!furnishings) return [] as string[];

    const tags: string[] = [];
    if (furnishings.has_elevator) tags.push(t(AMENITY_LABEL_KEYS.elevator));
    if (furnishings.has_security_guard) {
      tags.push(t(AMENITY_LABEL_KEYS.security_guard));
    }
    if (furnishings.has_car_parking) {
      tags.push(t(AMENITY_LABEL_KEYS.car_parking));
    }
    if (furnishings.has_bike_parking) {
      tags.push(t(AMENITY_LABEL_KEYS.motorbike_parking));
    }
    if (furnishings.pets_ok) tags.push(t(AMENITY_LABEL_KEYS.pet_friendly));
    if (furnishings.has_cleaning_service) {
      tags.push(t(AMENITY_LABEL_KEYS.cleaning_service));
    }

    for (const value of FURNISHING_VALUES) {
      const column = FURNISHING_COLUMN_BY_VALUE[value];
      if (furnishings[column] === true) {
        tags.push(t(FURNISHING_LABEL_KEYS[value]));
      }
      if (tags.length >= 8) break;
    }

    return tags.slice(0, 8);
  }, [property.furnishings, t]);

  const actionClassName =
    'flex w-full items-center justify-center rounded-lg bg-white py-3 text-sm font-bold text-[#1a1a1a] transition hover:bg-[#f3f4f6]';

  return (
    <article
      className={`flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-[#353f4b] shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${className ?? ''}`}
    >
      <div className="relative h-52 w-full shrink-0">
        <PropertyImageSlideshow
          images={slideshowImages}
          alt={imageAlt ?? property.name}
          sizes="(max-width: 640px) 100vw, 384px"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#353f4b] via-[#353f4b]/25 to-transparent" />

        <span
          className={`absolute left-3 top-3 z-10 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles(property.status)}`}
        >
          {t(`status.${property.status}` as TranslationKey)}
        </span>

        {onBookmark ? (
          <button
            type="button"
            onClick={onBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark property'}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight text-white">
              {property.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-white/65">
              {t(`type.${property.property_type}` as TranslationKey)}
            </p>
          </div>
          {rent ? (
            <div className="shrink-0 rounded-md bg-white/15 px-3 py-1.5 text-right">
              <p className="text-sm font-semibold text-white">{rent}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/60">
                /{t('list.perMonth')}
              </p>
            </div>
          ) : null}
        </div>

        {address ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/75">
            {address}
          </p>
        ) : null}

        {detailChips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {detailChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {featureTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {featureTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-md bg-[#1e4636]/80 px-2 py-1 text-[11px] font-medium text-[#d8efe4]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {property.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/65">
            {property.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2">
          {property.zalo_group_link ? (
            <a
              href={property.zalo_group_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0068ff] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0056d6]"
            >
              <ZaloIcon />
              {t('list.zaloGroup')}
            </a>
          ) : null}

          {href ? (
            <Link href={href} className={actionClassName}>
              {resolvedActionLabel}
            </Link>
          ) : (
            <button type="button" onClick={onAction} className={actionClassName}>
              {resolvedActionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
