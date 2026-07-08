'use client';

import type { Property } from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import PropertyImageLightbox from './PropertyImageLightbox';
import {
  formatAddress,
  formatBillStatus,
  formatBillType,
  formatBillingPeriod,
  formatDate,
  formatDepositMonths,
  formatFurnishingIncluded,
  formatLandlordInBuilding,
  formatMainGateLock,
  formatPrivateShared,
  formatPropertyType,
  formatRent,
  formatStatus,
  formatWashingMachine,
  furnishingStatusStyles,
  statusStyles,
  utilityBillStatusStyles,
} from './format';

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

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PropertyDetailProps {
  property: Property;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const rent = formatRent(property.rent_amount, property.rent_currency);
  const coverImage = property.images?.[0]?.public_url;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [furnishingsExpanded, setFurnishingsExpanded] = useState(true);
  const [utilityBillsExpanded, setUtilityBillsExpanded] = useState(true);

  return (
    <div className="p-6 sm:p-8">
      <Link
        href="/properties"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] transition hover:text-[#1e4636]"
      >
        <BackIcon />
        Back to properties
      </Link>

      <div className="overflow-hidden rounded-xl bg-[#353f4b] shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
        <div className="relative h-64 w-full sm:h-80">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#4b6a8a] via-[#5b7f9d] to-[#8eb4c9]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#353f4b] via-[#353f4b]/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${statusStyles(property.status)}`}
                >
                  {formatStatus(property.status)}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  {property.name}
                </h1>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  {formatAddress(property)}
                </p>
              </div>

              {rent ? (
                <div className="rounded-lg bg-white/15 px-4 py-3 text-right backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                    Monthly rent
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{rent}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {[
            { label: 'Property type', value: formatPropertyType(property.property_type) },
            { label: 'Bedrooms', value: property.bedrooms },
            { label: 'Bathrooms', value: property.bathrooms },
            {
              label: 'Area',
              value: property.area_sqm !== null ? `${property.area_sqm} sqm` : null,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {item.label}
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {item.value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Description</h2>
          <p className="mt-3 leading-relaxed text-[#6b7280]">
            {property.description ?? 'No description provided for this property.'}
          </p>
        </section>

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Location</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-[#9ca3af]">Address</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.address_line1}</dd>
              {property.address_line2 ? (
                <dd className="text-[#1a1a1a]">{property.address_line2}</dd>
              ) : null}
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">City / Province</dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {property.city}, {property.province}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">Postal code</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.postal_code ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">Country</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.country}</dd>
            </div>
          </dl>
        </section>

        {property.internal_notes ? (
          <section className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold text-[#92400e]">Internal notes</h2>
            <p className="mt-3 leading-relaxed text-[#a16207]">
              {property.internal_notes}
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            Room info &amp; amenities
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Room type', value: property.room_type },
              { label: 'Toilet', value: formatPrivateShared(property.toilet_type) },
              { label: 'Parking', value: formatPrivateShared(property.parking_type) },
              {
                label: 'Main gate lock',
                value: formatMainGateLock(property.main_gate_lock),
              },
              { label: 'Number of occupants', value: property.max_occupants },
              { label: 'Number of bikes (max)', value: property.max_bikes },
              { label: 'Floor', value: property.floor },
              {
                label: 'Drying area',
                value: formatPrivateShared(property.drying_area),
              },
              {
                label: 'Deposit for',
                value: formatDepositMonths(property.deposit_months),
              },
              {
                label: 'Area',
                value:
                  property.area_sqm !== null ? `${property.area_sqm} sqm` : null,
              },
              {
                label: 'Holding deposit',
                value: formatRent(
                  property.holding_deposit,
                  property.rent_currency,
                ),
              },
              { label: 'Number of bedrooms', value: property.bedrooms },
              { label: 'Number of bathrooms', value: property.bathrooms },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-medium text-[#9ca3af]">{item.label}</dt>
                <dd className="mt-1 font-medium text-[#1a1a1a]">
                  {item.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {property.furnishings ? (
          <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
            <button
              type="button"
              onClick={() => setFurnishingsExpanded((prev) => !prev)}
              aria-expanded={furnishingsExpanded}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Furnishings</h2>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]">
                <CollapseIcon expanded={furnishingsExpanded} />
              </span>
            </button>
            {furnishingsExpanded ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e4dc] text-xs uppercase tracking-wider text-[#9ca3af]">
                      <th className="px-3 py-3 font-semibold">Item</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                        Item
                      </th>
                      <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const items = [
                        {
                          label: 'Loft',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_loft,
                          ),
                          included: property.furnishings.has_loft,
                        },
                        {
                          label: 'Window',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_window,
                          ),
                          included: property.furnishings.has_window,
                        },
                        {
                          label: 'Balcony',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_balcony,
                          ),
                          included: property.furnishings.has_balcony,
                        },
                        {
                          label: 'Fridge',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_fridge,
                          ),
                          included: property.furnishings.has_fridge,
                        },
                        {
                          label: 'TV',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_tv,
                          ),
                          included: property.furnishings.has_tv,
                        },
                        {
                          label: 'Air conditioner',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_air_conditioner,
                          ),
                          included: property.furnishings.has_air_conditioner,
                        },
                        {
                          label: 'Washing machine',
                          value: formatWashingMachine(
                            property.furnishings.washing_machine,
                          ),
                          included: null,
                        },
                        {
                          label: 'Kitchen staff',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_kitchen_staff,
                          ),
                          included: property.furnishings.has_kitchen_staff,
                        },
                        {
                          label: 'Hot water',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_hot_water,
                          ),
                          included: property.furnishings.has_hot_water,
                        },
                        {
                          label: 'Bed',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_bed,
                          ),
                          included: property.furnishings.has_bed,
                        },
                        {
                          label: 'Mattress',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_mattress,
                          ),
                          included: property.furnishings.has_mattress,
                        },
                        {
                          label: 'Wardrobe',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_wardrobe,
                          ),
                          included: property.furnishings.has_wardrobe,
                        },
                        {
                          label: 'Pillow',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_pillow,
                          ),
                          included: property.furnishings.has_pillow,
                        },
                        {
                          label: 'Blanket',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_blanket,
                          ),
                          included: property.furnishings.has_blanket,
                        },
                        {
                          label: 'Landlord',
                          value: formatLandlordInBuilding(
                            property.furnishings.landlord_in_building,
                          ),
                          included: null,
                        },
                        {
                          label: 'Elevator',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_elevator,
                          ),
                          included: property.furnishings.has_elevator,
                        },
                        {
                          label: 'Security guard',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_security_guard,
                          ),
                          included: property.furnishings.has_security_guard,
                        },
                        {
                          label: 'Skylight',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_skylight,
                          ),
                          included: property.furnishings.has_skylight,
                        },
                        {
                          label: 'Pool',
                          value: formatFurnishingIncluded(
                            property.furnishings.has_pool,
                          ),
                          included: property.furnishings.has_pool,
                        },
                      ];

                      const makeBadge = (item: (typeof items)[number]) => (
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                            item.included === null
                              ? 'bg-[#f3f4f6] text-[#6b7280]'
                              : furnishingStatusStyles(item.included)
                          }`}
                        >
                          {item.value}
                        </span>
                      );

                      const rows = Math.ceil(items.length / 2);

                      return Array.from({ length: rows }, (_, rowIndex) => {
                        const left = items[rowIndex * 2];
                        const right = items[rowIndex * 2 + 1];
                        const isLastRow = rowIndex === rows - 1;

                        return (
                          <tr
                            key={`${left.label}-${right?.label ?? 'empty'}`}
                            className={`border-b border-[#f3f4f6] ${
                              isLastRow ? 'last:border-b-0' : ''
                            }`}
                          >
                            <td className="px-3 py-4 font-medium text-[#1a1a1a]">
                              {left.label}
                            </td>
                            <td className="px-3 py-4">{makeBadge(left)}</td>
                            <td className="hidden px-3 py-4 font-medium text-[#1a1a1a] sm:table-cell">
                              {right?.label ?? ''}
                            </td>
                            <td className="hidden px-3 py-4 sm:table-cell">
                              {right ? makeBadge(right) : null}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ) : null}

        {property.utility_bills.length > 0 ? (
          <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
            <button
              type="button"
              onClick={() => setUtilityBillsExpanded((prev) => !prev)}
              aria-expanded={utilityBillsExpanded}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Utility bills</h2>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]">
                <CollapseIcon expanded={utilityBillsExpanded} />
              </span>
            </button>
            {utilityBillsExpanded ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e4dc] text-xs uppercase tracking-wider text-[#9ca3af]">
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Period</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold">Provider</th>
                      <th className="px-3 py-3 font-semibold">Due date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.utility_bills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b border-[#f3f4f6] last:border-b-0"
                      >
                        <td className="px-3 py-4 font-medium text-[#1a1a1a]">
                          {formatBillType(bill.bill_type)}
                        </td>
                        <td className="px-3 py-4 text-[#6b7280]">
                          {formatBillingPeriod(
                            bill.billing_period_start,
                            bill.billing_period_end,
                          )}
                        </td>
                        <td className="px-3 py-4 font-medium text-[#1a1a1a]">
                          {formatRent(bill.amount, bill.currency)}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${utilityBillStatusStyles(bill.status)}`}
                          >
                            {formatBillStatus(bill.status)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-[#6b7280]">
                          {bill.provider_name ?? '—'}
                        </td>
                        <td className="px-3 py-4 text-[#6b7280]">
                          {bill.due_date ? formatDate(bill.due_date) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ) : null}

        {property.images.length > 1 ? (
          <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {property.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f3f4f6] text-left"
                  aria-label={`Show image ${index + 1} in full`}
                >
                  <Image
                    src={image.public_url}
                    alt={`${property.name} image ${index + 1}`}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/35">
                    <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] opacity-0 transition duration-300 group-hover:opacity-100">
                      Show in full
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {lightboxIndex !== null ? (
          <PropertyImageLightbox
            images={property.images}
            activeIndex={lightboxIndex}
            propertyName={property.name}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        ) : null}

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Record info</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[#9ca3af]">Property ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-[#1a1a1a]">
                {property.id}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">Created</dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {formatDate(property.created_at)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">Last updated</dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {formatDate(property.updated_at)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
