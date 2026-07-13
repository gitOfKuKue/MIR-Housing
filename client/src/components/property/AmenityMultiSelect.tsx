'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  AMENITY_VALUES,
  type AmenityValue,
} from '@/src/lib/amenities';
import { useEffect, useId, useRef } from 'react';

interface AmenityMultiSelectProps {
  value: AmenityValue[];
  onChange: (value: AmenityValue[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelClassName?: string;
  triggerClassName?: string;
}

export const AMENITY_LABEL_KEYS: Record<AmenityValue, TranslationKey> = {
  elevator: 'amenity.elevator',
  shared_washing_machine: 'amenity.sharedWashingMachine',
  private_washing_machine: 'amenity.privateWashingMachine',
  security_guard: 'amenity.securityGuard',
  car_parking: 'amenity.carParking',
  motorbike_parking: 'amenity.motorbikeParking',
  ev_parking: 'amenity.evParking',
  pet_friendly: 'amenity.petFriendly',
  foreigner_friendly: 'amenity.foreignerFriendly',
  solar_water_heater: 'amenity.solarWaterHeater',
  cleaning_service: 'amenity.cleaningService',
};

export default function AmenityMultiSelect({
  value,
  onChange,
  open,
  onOpenChange,
  labelClassName,
  triggerClassName,
}: AmenityMultiSelectProps) {
  const t = useTranslations();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, onOpenChange]);

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
    <div ref={rootRef} className="block">
      <span className={labelClassName}>{t('properties.filterAmenity')}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => onOpenChange(!open)}
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
          className="mt-1 max-h-72 w-full overflow-auto rounded-md border border-[#e5e7eb] bg-white py-1"
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
