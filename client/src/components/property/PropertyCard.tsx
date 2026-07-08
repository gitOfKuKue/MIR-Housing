'use client';

import type { Property } from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatPropertyType,
  formatRent,
  formatStatus,
} from './format';

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

function BedIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 13v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 13h18M3 13V9a2 2 0 012-2h3v6H3zM21 13V9a2 2 0 00-2-2h-3v6h5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  actionLabel = 'View details',
  href,
  onAction,
  bookmarked = false,
  onBookmark,
  className,
}: PropertyCardProps) {
  const rent = formatRent(property.rent_amount, property.rent_currency);
  const resolvedImageUrl = imageUrl ?? property.images?.[0]?.public_url;
  const description =
    property.description ??
    `${property.address_line1}, ${property.city}, ${property.province}`;

  const tags = [
    property.bedrooms !== null
      ? { icon: <BedIcon />, label: `${property.bedrooms} Bed` }
      : null,
    { label: formatPropertyType(property.property_type) },
    { label: formatStatus(property.status) },
  ].filter(Boolean) as Array<{ icon?: React.ReactNode; label: string }>;

  const actionClassName =
    'mt-5 flex w-full items-center justify-center rounded-lg bg-white py-3.5 text-sm font-bold text-[#1a1a1a] transition hover:bg-[#f3f4f6]';

  return (
    <article
      className={`flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-[#353f4b] shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${className ?? ''}`}
    >
      <div className="relative h-56 w-full shrink-0">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={imageAlt ?? property.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#353f4b] via-[#353f4b]/20 to-transparent" />

        {onBookmark ? (
          <button
            type="button"
            onClick={onBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark property'}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-white">
            {property.name}
          </h3>
          {rent ? (
            <span className="shrink-0 rounded-md bg-white/15 px-3 py-1 text-sm font-semibold text-white">
              {rent}
            </span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/75">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
            >
              {tag.icon}
              {tag.label}
            </span>
          ))}
        </div>

        {href ? (
          <Link href={href} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={actionClassName}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
