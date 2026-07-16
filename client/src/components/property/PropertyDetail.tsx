'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type { Property, Room } from '@/src/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyImageLightbox from './PropertyImageLightbox';
import { deleteProperty } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import { isRoomTypeValue } from '@/src/lib/room-types';
import { canManageProperties } from '@/src/lib/roles';
import {
  formatAddress,
  formatBillingPeriod,
  formatDate,
  formatRent,
  statusStyles,
  utilityBillStatusStyles,
} from './format';
import { ROOM_TYPE_LABEL_KEYS } from './RoomTypeSelect';
import { AMENITY_LABEL_KEYS } from './AmenityMultiSelect';
import { FURNISHING_LABEL_KEYS } from './FurnishingMultiSelect';
import { FURNISHING_VALUES } from '@/src/lib/furnishings';
import { FURNISHING_COLUMN_BY_VALUE } from '@/src/lib/furnishings-selection';

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

function translateLandlordInBuilding(
  t: TranslateFn,
  value: boolean | null | undefined,
): string {
  if (value === true) return t('value.sameBuilding');
  if (value === false) return t('value.notSameBuilding');
  return '—';
}

function roomFurnitureLabels(room: Room, t: TranslateFn): string[] {
  return FURNISHING_VALUES.flatMap((value) => {
    const key = FURNISHING_COLUMN_BY_VALUE[value];
    if (room[key as keyof Room] !== true) return [];
    return [t(FURNISHING_LABEL_KEYS[value])];
  });
}

function roomTypeLabel(room: Room, t: TranslateFn): string | null {
  if (!room.room_type) return null;
  if (isRoomTypeValue(room.room_type)) {
    return t(ROOM_TYPE_LABEL_KEYS[room.room_type]);
  }
  return room.room_type;
}

function formatRentRange(
  rooms: Room[],
  fallbackAmount: number | null,
  fallbackCurrency: string,
): string | null {
  const amounts = rooms
    .map((room) => room.rent_amount)
    .filter((amount): amount is number => amount !== null);

  if (amounts.length === 0) {
    return formatRent(fallbackAmount, fallbackCurrency);
  }

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const currency =
    rooms.find((room) => room.rent_amount !== null)?.rent_currency ??
    fallbackCurrency;

  if (min === max) {
    return formatRent(min, currency);
  }

  const minLabel = formatRent(min, currency);
  const maxLabel = formatRent(max, currency);
  if (!minLabel || !maxLabel) return null;
  return `${minLabel} – ${maxLabel}`;
}

interface PropertyDetailProps {
  property: Property;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const t = useTranslations();
  const rooms = property.rooms ?? [];
  const availableRoomCount = rooms.filter(
    (room) => room.status === 'available',
  ).length;
  const rent = formatRentRange(
    rooms,
    property.rent_amount,
    property.rent_currency,
  );
  const coverImage = property.images?.[0]?.public_url;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(true);
  const [utilityBillsExpanded, setUtilityBillsExpanded] = useState(true);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [roomLightbox, setRoomLightbox] = useState<{
    images: Property['rooms'][number]['images'] | Property['images'];
    index: number;
    name: string;
  } | null>(null);
  const router = useRouter();
  const authUser = getAuthUser();
  const canEdit = Boolean(authUser);
  const canDelete = canManageProperties(authUser?.role);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const buildingAmenityItems = (() => {
    const furnishings = property.furnishings;
    if (!furnishings) return [];

    return [
      {
        label: t(AMENITY_LABEL_KEYS.elevator),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_elevator === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.security_guard),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_security_guard === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.car_parking),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_car_parking === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.motorbike_parking),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_bike_parking === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.ev_parking),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_ev_parking === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.pet_friendly),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.pets_ok === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.foreigner_friendly),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.foreigners_ok === true,
      },
      {
        label: t(AMENITY_LABEL_KEYS.cleaning_service),
        value: translateFurnishingIncluded(t, true),
        show: furnishings.has_cleaning_service === true,
      },
      {
        label: t('furnishing.landlord'),
        value: translateLandlordInBuilding(t, furnishings.landlord_in_building),
        show: furnishings.landlord_in_building === true,
      },
    ].filter((item) => item.show);
  })();

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
            {
              label: t('detail.rooms'),
              value:
                rooms.length > 0
                  ? t('detail.roomsCount', { count: rooms.length })
                  : '—',
            },
            {
              label: t('status.available'),
              value:
                rooms.length > 0
                  ? t('detail.roomsAvailable', { count: availableRoomCount })
                  : '—',
            },
            {
              label: t('detail.area'),
              value:
                rooms.length === 1 && rooms[0].area_sqm !== null
                  ? `${rooms[0].area_sqm} sqm`
                  : property.area_sqm !== null
                    ? `${property.area_sqm} sqm`
                    : null,
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
                {t('detail.street')}
              </dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.street ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">{t('detail.ward')}</dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.ward ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#9ca3af]">
                {t('detail.district')}
              </dt>
              <dd className="mt-1 text-[#1a1a1a]">{property.district ?? '—'}</dd>
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

        {property.zalo_group_link ? (
          <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">
              {t('detail.zaloGroupLink')}
            </h2>
            <a
              href={property.zalo_group_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex break-all text-sm font-medium text-[#1e4636] underline-offset-2 hover:underline"
            >
              {property.zalo_group_link}
            </a>
          </section>
        ) : null}

        {(() => {
          const monthlyFees = [
            {
              label: t('form.feeElectricity'),
              value: property.fee_electricity,
            },
            {
              label: t('form.feeWater'),
              value: property.fee_water
                ? property.fee_water_type === 'fixed'
                  ? `${property.fee_water} (${t('form.feeWaterFixed')})`
                  : property.fee_water_type === 'per_m3'
                    ? `${property.fee_water} (${t('form.feeWaterPerM3')})`
                    : property.fee_water
                : null,
            },
            { label: t('form.feeMotorbike'), value: property.fee_motorbike },
            { label: t('form.feeCar'), value: property.fee_car },
            { label: t('form.feeWifi'), value: property.fee_wifi },
            {
              label: t('form.feeManagement'),
              value: property.fee_management,
            },
          ].filter((item) => item.value);

          if (monthlyFees.length === 0) return null;

          return (
            <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                {t('form.monthlyFees')}
              </h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {monthlyFees.map((item) => (
                  <div key={item.label}>
                    <dt className="font-medium text-[#9ca3af]">{item.label}</dt>
                    <dd className="mt-1 font-medium text-[#1a1a1a]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })()}

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">
              {t('detail.rooms')}
            </h2>
            {rooms.length > 0 ? (
              <p className="text-sm text-[#6b7280]">
                {t('detail.roomsCount', { count: rooms.length })}
                {' · '}
                {t('detail.roomsAvailable', { count: availableRoomCount })}
              </p>
            ) : null}
          </div>

          {rooms.length === 0 ? (
            <p className="mt-4 text-sm text-[#6b7280]">{t('detail.noRooms')}</p>
          ) : (
            <>
              <nav
                className="mt-5 flex flex-wrap gap-1.5"
                aria-label={t('detail.rooms')}
              >
                {rooms.map((room, index) => {
                  const label =
                    room.name?.trim() || t('form.roomTab', { n: index + 1 });
                  const isActive = index === activeRoomIndex;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setActiveRoomIndex(index)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#1e4636] text-white'
                          : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
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

              {(() => {
                const safeIndex = Math.min(
                  activeRoomIndex,
                  Math.max(rooms.length - 1, 0),
                );
                const room = rooms[safeIndex];
                if (!room) return null;

                const roomRent = formatRent(
                  room.rent_amount,
                  room.rent_currency || property.rent_currency,
                );
                const furniture = roomFurnitureLabels(room, t);
                const typeLabel = roomTypeLabel(room, t);
                const title =
                  room.name?.trim() ||
                  t('form.roomTab', { n: safeIndex + 1 });
                const roomPhotos =
                  room.images?.length > 0
                    ? room.images
                    : rooms.length === 1
                      ? property.images
                      : [];

                return (
                  <div className="mt-5">
                    <div className="rounded-xl border border-[#f3f4f6] bg-[#fafaf9] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-[#1a1a1a]">
                              {title}
                            </h3>
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusStyles(room.status)}`}
                            >
                              {t(`status.${room.status}` as TranslationKey)}
                            </span>
                          </div>
                          {typeLabel ? (
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {typeLabel}
                            </p>
                          ) : null}
                        </div>
                        {roomRent ? (
                          <p className="text-base font-semibold text-[#1e4636]">
                            {roomRent}
                            <span className="ml-1 text-xs font-medium text-[#6b7280]">
                              /{t('list.perMonth')}
                            </span>
                          </p>
                        ) : null}
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          { label: t('detail.floor'), value: room.floor },
                          {
                            label: t('detail.area'),
                            value:
                              room.area_sqm !== null
                                ? `${room.area_sqm} sqm`
                                : null,
                          },
                          {
                            label: t('properties.bedrooms'),
                            value: room.bedrooms,
                          },
                          {
                            label: t('properties.bathrooms'),
                            value: room.bathrooms,
                          },
                          {
                            label: t('detail.depositFor'),
                            value: translateDepositMonths(
                              t,
                              room.deposit_months,
                            ),
                          },
                          {
                            label: t('detail.holdingDeposit'),
                            value: formatRent(
                              room.holding_deposit,
                              room.rent_currency || property.rent_currency,
                            ),
                          },
                        ].map((item) => (
                          <div key={`${room.id}-${item.label}`}>
                            <dt className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                              {item.label}
                            </dt>
                            <dd className="mt-1 font-medium text-[#1a1a1a]">
                              {item.value ?? '—'}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {room.description ? (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                            {t('detail.roomNotes')}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[#4b5563]">
                            {room.description}
                          </p>
                        </div>
                      ) : null}

                      {furniture.length > 0 ? (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                            {t('detail.roomFurniture')}
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {furniture.map((label) => (
                              <li
                                key={`${room.id}-${label}`}
                                className="rounded-md bg-[#e8f3ed] px-2.5 py-1 text-xs font-medium text-[#1e4636]"
                              >
                                {label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                        {t('detail.gallery')}
                      </p>
                      {roomPhotos.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {roomPhotos.map((image, imageIndex) => (
                            <li key={image.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  setRoomLightbox({
                                    images: roomPhotos,
                                    index: imageIndex,
                                    name: title,
                                  })
                                }
                                className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#e5e7eb]"
                                aria-label={`${t('detail.showInFull')} ${imageIndex + 1}`}
                              >
                                <Image
                                  src={image.public_url}
                                  alt={`${title} ${imageIndex + 1}`}
                                  fill
                                  className="object-cover transition duration-300 group-hover:scale-105"
                                  sizes="(max-width: 640px) 50vw, 240px"
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-[#6b7280]">
                          {t('detail.noRoomPhotos')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </section>

        {buildingAmenityItems.length > 0 ? (
          <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 lg:col-span-3">
            <button
              type="button"
              onClick={() => setAmenitiesExpanded((prev) => !prev)}
              aria-expanded={amenitiesExpanded}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <h2 className="text-lg font-semibold text-[#1a1a1a]">
                {t('detail.buildingAmenities')}
              </h2>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]">
                <CollapseIcon expanded={amenitiesExpanded} />
              </span>
            </button>
            {amenitiesExpanded ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {buildingAmenityItems.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-md bg-[#f3f4f6] px-3 py-1.5 text-sm font-medium text-[#1a1a1a]"
                  >
                    {item.label}
                    {item.label === t('furnishing.landlord')
                      ? ` · ${item.value}`
                      : null}
                  </li>
                ))}
              </ul>
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

        {roomLightbox ? (
          <PropertyImageLightbox
            images={roomLightbox.images}
            activeIndex={roomLightbox.index}
            propertyName={roomLightbox.name}
            onClose={() => setRoomLightbox(null)}
            onNavigate={(index) =>
              setRoomLightbox((prev) => (prev ? { ...prev, index } : null))
            }
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
