'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type { Property } from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyImageLightbox from './PropertyImageLightbox';
import { deleteProperty } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import {
  formatAddress,
  formatBillingPeriod,
  formatDate,
  formatRent,
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

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

function translatePrivateShared(
  t: TranslateFn,
  value: 'private' | 'shared' | null | undefined,
): string | null {
  if (!value) return null;
  return value === 'private' ? t('value.private') : t('value.shared');
}

function translateMainGateLock(
  t: TranslateFn,
  value: 'standard' | 'none' | null | undefined,
): string | null {
  if (!value) return null;
  return value === 'standard' ? t('value.standard') : t('value.none');
}

function translateDepositMonths(
  t: TranslateFn,
  months: number | null | undefined,
): string | null {
  if (months === null || months === undefined) return null;
  return months === 1 ? t('value.month') : t('value.months', { count: months });
}

function translateFurnishingIncluded(
  t: TranslateFn,
  value: boolean | null | undefined,
): string {
  if (value === true) return t('value.included');
  if (value === false) return t('value.notIncluded');
  return '—';
}

function translateWashingMachine(
  t: TranslateFn,
  value: 'private' | 'shared' | 'not_available' | null | undefined,
): string {
  if (value === 'private') return t('value.private');
  if (value === 'shared') return t('value.shared');
  if (value === 'not_available') return t('value.notAvailable');
  return '—';
}

function translateLandlordInBuilding(
  t: TranslateFn,
  value: boolean | null | undefined,
): string {
  if (value === true) return t('value.sameBuilding');
  if (value === false) return t('value.notSameBuilding');
  return '—';
}

interface PropertyDetailProps {
  property: Property;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const t = useTranslations();
  const rent = formatRent(property.rent_amount, property.rent_currency);
  const coverImage = property.images?.[0]?.public_url;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [furnishingsExpanded, setFurnishingsExpanded] = useState(true);
  const [utilityBillsExpanded, setUtilityBillsExpanded] = useState(true);
  const router = useRouter();
  const authUser = getAuthUser();
  const canEdit = Boolean(authUser);
  const canDelete = authUser?.role === 'admin';
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openDeleteConfirm() {
    if (!canDelete) return;
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!canDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProperty(property.id);
      router.push('/properties');
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : t('detail.deleteFailed'),
      );
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] transition hover:text-[#1e4636]"
        >
          <BackIcon />
          {t('detail.backToProperties')}
        </Link>

        {canEdit ? (
          <Link
            href={`/properties/${property.id}/edit`}
            className="rounded-md bg-[#1e4636] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163829]"
          >
            {t('common.edit')}
          </Link>
        ) : null}
      </div>

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
                  {t(`status.${property.status}` as TranslationKey)}
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
                    {t('properties.monthlyRent')}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{rent}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {[
            {
              label: t('detail.propertyType'),
              value: t(`type.${property.property_type}` as TranslationKey),
            },
            { label: t('properties.bedrooms'), value: property.bedrooms },
            { label: t('properties.bathrooms'), value: property.bathrooms },
            {
              label: t('detail.area'),
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
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('detail.description')}
          </h2>
          <p className="mt-3 leading-relaxed text-[#6b7280]">
            {property.description ?? t('detail.noDescription')}
          </p>
        </section>

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('detail.location')}
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-[#9ca3af]">{t('detail.address')}</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.address_line1}</dd>
              {property.address_line2 ? (
                <dd className="text-[#1a1a1a]">{property.address_line2}</dd>
              ) : null}
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">
                {t('detail.cityProvince')}
              </dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {property.city}, {property.province}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">
                {t('detail.postalCode')}
              </dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.postal_code ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">{t('detail.country')}</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.country}</dd>
            </div>
          </dl>
        </section>

        {property.internal_notes ? (
          <section className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold text-[#92400e]">
              {t('detail.internalNotes')}
            </h2>
            <p className="mt-3 leading-relaxed text-[#a16207]">
              {property.internal_notes}
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('detail.roomInfo')}
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: t('detail.roomType'), value: property.room_type },
              {
                label: t('detail.toilet'),
                value: translatePrivateShared(t, property.toilet_type),
              },
              {
                label: t('detail.parking'),
                value: translatePrivateShared(t, property.parking_type),
              },
              {
                label: t('detail.mainGateLock'),
                value: translateMainGateLock(t, property.main_gate_lock),
              },
              { label: t('detail.maxOccupants'), value: property.max_occupants },
              { label: t('detail.maxBikes'), value: property.max_bikes },
              { label: t('detail.floor'), value: property.floor },
              {
                label: t('detail.dryingArea'),
                value: translatePrivateShared(t, property.drying_area),
              },
              {
                label: t('detail.depositFor'),
                value: translateDepositMonths(t, property.deposit_months),
              },
              {
                label: t('detail.area'),
                value:
                  property.area_sqm !== null ? `${property.area_sqm} sqm` : null,
              },
              {
                label: t('detail.holdingDeposit'),
                value: formatRent(
                  property.holding_deposit,
                  property.rent_currency,
                ),
              },
              { label: t('properties.bedrooms'), value: property.bedrooms },
              { label: t('properties.bathrooms'), value: property.bathrooms },
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
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                {t('detail.furnishings')}
              </h2>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]">
                <CollapseIcon expanded={furnishingsExpanded} />
              </span>
            </button>
            {furnishingsExpanded ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e4dc] text-xs uppercase tracking-wider text-[#9ca3af]">
                      <th className="px-3 py-3 font-semibold">{t('detail.item')}</th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.status')}
                      </th>
                      <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                        {t('detail.item')}
                      </th>
                      <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                        {t('detail.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const items = [
                        {
                          label: t('furnishing.loft'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_loft,
                          ),
                          included: property.furnishings.has_loft,
                        },
                        {
                          label: t('furnishing.window'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_window,
                          ),
                          included: property.furnishings.has_window,
                        },
                        {
                          label: t('furnishing.balcony'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_balcony,
                          ),
                          included: property.furnishings.has_balcony,
                        },
                        {
                          label: t('furnishing.fridge'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_fridge,
                          ),
                          included: property.furnishings.has_fridge,
                        },
                        {
                          label: t('furnishing.tv'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_tv,
                          ),
                          included: property.furnishings.has_tv,
                        },
                        {
                          label: t('furnishing.airConditioner'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_air_conditioner,
                          ),
                          included: property.furnishings.has_air_conditioner,
                        },
                        {
                          label: t('furnishing.washingMachine'),
                          value: translateWashingMachine(
                            t,
                            property.furnishings.washing_machine,
                          ),
                          included: null,
                        },
                        {
                          label: t('furnishing.kitchenStaff'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_kitchen_staff,
                          ),
                          included: property.furnishings.has_kitchen_staff,
                        },
                        {
                          label: t('furnishing.hotWater'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_hot_water,
                          ),
                          included: property.furnishings.has_hot_water,
                        },
                        {
                          label: t('furnishing.bed'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_bed,
                          ),
                          included: property.furnishings.has_bed,
                        },
                        {
                          label: t('furnishing.mattress'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_mattress,
                          ),
                          included: property.furnishings.has_mattress,
                        },
                        {
                          label: t('furnishing.wardrobe'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_wardrobe,
                          ),
                          included: property.furnishings.has_wardrobe,
                        },
                        {
                          label: t('furnishing.pillow'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_pillow,
                          ),
                          included: property.furnishings.has_pillow,
                        },
                        {
                          label: t('furnishing.blanket'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_blanket,
                          ),
                          included: property.furnishings.has_blanket,
                        },
                        {
                          label: t('furnishing.landlord'),
                          value: translateLandlordInBuilding(
                            t,
                            property.furnishings.landlord_in_building,
                          ),
                          included: null,
                        },
                        {
                          label: t('furnishing.elevator'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_elevator,
                          ),
                          included: property.furnishings.has_elevator,
                        },
                        {
                          label: t('furnishing.securityGuard'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_security_guard,
                          ),
                          included: property.furnishings.has_security_guard,
                        },
                        {
                          label: t('furnishing.skylight'),
                          value: translateFurnishingIncluded(
                            t,
                            property.furnishings.has_skylight,
                          ),
                          included: property.furnishings.has_skylight,
                        },
                        {
                          label: t('furnishing.pool'),
                          value: translateFurnishingIncluded(
                            t,
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
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                {t('detail.utilityBills')}
              </h2>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]">
                <CollapseIcon expanded={utilityBillsExpanded} />
              </span>
            </button>
            {utilityBillsExpanded ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e4dc] text-xs uppercase tracking-wider text-[#9ca3af]">
                      <th className="px-3 py-3 font-semibold">{t('detail.type')}</th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.period')}
                      </th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.amount')}
                      </th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.status')}
                      </th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.provider')}
                      </th>
                      <th className="px-3 py-3 font-semibold">
                        {t('detail.dueDate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.utility_bills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b border-[#f3f4f6] last:border-b-0"
                      >
                        <td className="px-3 py-4 font-medium text-[#1a1a1a]">
                          {t(`bill.${bill.bill_type}` as TranslationKey)}
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
                            {t(`bill.${bill.status}` as TranslationKey)}
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
            <h2 className="text-lg font-semibold text-[#1a1a1a]">
              {t('detail.gallery')}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {property.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f3f4f6] text-left"
                  aria-label={`${t('detail.showInFull')} ${index + 1}`}
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
                      {t('detail.showInFull')}
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">
              {t('detail.recordInfo')}
            </h2>

            {canDelete ? (
              <button
                type="button"
                onClick={openDeleteConfirm}
                disabled={deleting}
                className="rounded-md bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-60"
                aria-busy={deleting}
              >
                {deleting ? t('common.deleting') : t('detail.deleteProperty')}
              </button>
            ) : null}
          </div>

          {deleteError ? (
            <p className="mt-3 text-sm font-medium text-[#b91c1c]">
              {deleteError}
            </p>
          ) : null}
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[#9ca3af]">
                {t('detail.propertyId')}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-[#1a1a1a]">
                {property.id}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">{t('detail.created')}</dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {formatDate(property.created_at)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">
                {t('detail.lastUpdated')}
              </dt>
              <dd className="mt-1 text-[#1a1a1a]">
                {formatDate(property.updated_at)}
              </dd>
            </div>
          </dl>
        </section>

        {deleteConfirmOpen ? (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={t('detail.deleteConfirmTitle')}
            onClick={() => {
              if (!deleting) setDeleteConfirmOpen(false);
            }}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#1a1a1a]">
                {t('detail.deleteConfirmTitle')}
              </h3>
              <p className="mt-2 text-sm text-[#6b7280]">
                {t('detail.deleteConfirmBody')}{' '}
                <span className="font-mono text-xs text-[#1a1a1a]">
                  {property.id}
                </span>
              </p>

              {deleteError ? (
                <p className="mt-4 text-sm font-medium text-[#b91c1c]">
                  {deleteError}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!deleting) setDeleteConfirmOpen(false);
                  }}
                  disabled={deleting}
                  className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="rounded-md bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? t('common.deleting') : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
