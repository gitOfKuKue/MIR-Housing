'use client';

import type { Property } from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatAddress,
  formatPropertyType,
  formatRent,
  formatStatus,
  statusStyles,
} from './format';

export interface PropertyListItemProps {
  property: Property;
  href?: string;
  className?: string;
}

export default function PropertyListItem({
  property,
  href,
  className,
}: PropertyListItemProps) {
  const rent = formatRent(property.rent_amount, property.rent_currency);
  const imageUrl = property.images?.[0]?.public_url;
  const address = formatAddress(property);

  const content = (
    <>
      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9] sm:h-24 sm:w-36">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="144px"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[#1a1a1a]">
              {property.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-[#6b7280]">
              {address}
            </p>
          </div>

          {rent ? (
            <span className="shrink-0 text-base font-semibold text-[#1e4636]">
              {rent}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles(property.status)}`}
          >
            {formatStatus(property.status)}
          </span>
          <span className="inline-flex rounded-md bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
            {formatPropertyType(property.property_type)}
          </span>
          {property.bedrooms !== null ? (
            <span className="inline-flex rounded-md bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
              {property.bedrooms} bed
            </span>
          ) : null}
          {property.bathrooms !== null ? (
            <span className="inline-flex rounded-md bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
              {property.bathrooms} bath
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  const classNames = `flex w-full flex-col gap-4 rounded-xl border border-[#e8e4dc] bg-white p-4 shadow-sm transition hover:border-[#1e4636]/20 hover:shadow-md sm:flex-row sm:items-center ${className ?? ''}`;

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {content}
      </Link>
    );
  }

  return <article className={classNames}>{content}</article>;
}
