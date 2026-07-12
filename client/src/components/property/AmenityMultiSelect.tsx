'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  AMENITY_VALUES,
  type AmenityValue,
} from '@/src/lib/amenities';
import { useEffect, useId, useRef, useState } from 'react';

interface AmenityMultiSelectProps {
  value: AmenityValue[];
  onChange: (value: AmenityValue[]) => void;
  labelClassName?: string;
  triggerClassName?: string;
}

export const AMENITY_LABEL_KEYS: Record<AmenityValue, TranslationKey> = {
  elevator: 'amenity.elevator',
  shared_washing_machine: 'amenity.sharedWashingMachine',
  private_washing_machine: 'amenity.privateWashingMachine',
  security_24_7: 'amenity.security247',
  car_parking: 'amenity.carParking',
  bike_parking: 'amenity.bikeParking',
  fixed_electricity: 'amenity.fixedElectricity',
  pets_ok: 'amenity.petsOk',
  foreigners_ok: 'amenity.foreignersOk',
  solar_hot_water: 'amenity.solarHotWater',
  cleaning_service: 'amenity.cleaningService',
};

export default function AmenityMultiSelect({
  value,
  onChange,
  labelClassName,
  triggerClassName,
}: AmenityMultiSelectProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selected = new Set(value);

  const summary =
    value.length === 0
      ? t('properties.selectAmenity')
      : value.map((item) => t(AMENITY_LABEL_KEYS[item])).join(', ');

  function toggle(option: AmenityValue) {
    if (selected.has(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className={labelClassName}>{t('properties.filterAmenity')}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={
          triggerClassName ??
          'flex w-full items-center justify-between rounded-md border border-[#e5e7eb] bg-white px-3 py-2.5 text-left text-sm text-[#1a1a1a] outline-none transition focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10'
        }
      >
        <span
          className={`truncate ${value.length === 0 ? 'text-[#9ca3af]' : ''}`}
        >
          {summary}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-[#9ca3af] transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          {AMENITY_VALUES.map((option) => {
            const checked = selected.has(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f9fafb]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option)}
                  className="h-4 w-4 rounded border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
                />
                {t(AMENITY_LABEL_KEYS[option])}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
