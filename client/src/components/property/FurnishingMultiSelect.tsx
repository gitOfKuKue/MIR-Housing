'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  FURNISHING_VALUES,
  type FurnishingValue,
} from '@/src/lib/furnishings';
import { useEffect, useId, useRef } from 'react';

interface FurnishingMultiSelectProps {
  value: FurnishingValue[];
  onChange: (value: FurnishingValue[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelClassName?: string;
  triggerClassName?: string;
}

export const FURNISHING_LABEL_KEYS: Record<FurnishingValue, TranslationKey> = {
  air_conditioner: 'furnishing.airConditioner',
  fridge: 'furnishing.fridge',
  wardrobe: 'furnishing.wardrobe',
  upper_kitchen_cabinet: 'furnishing.upperKitchenCabinet',
  lower_kitchen_cabinet: 'furnishing.lowerKitchenCabinet',
  kitchen_counter: 'furnishing.kitchenCounter',
  mattress: 'furnishing.mattress',
  bed: 'furnishing.bed',
  shoe_cabinet: 'furnishing.shoeCabinet',
  window_outdoor_view: 'furnishing.windowOutdoorView',
  window_corridor: 'furnishing.windowCorridor',
  window_air_well: 'furnishing.windowAirWell',
  balcony: 'furnishing.balcony',
  ventilation_window: 'furnishing.ventilationWindow',
  dining_table: 'furnishing.diningTable',
  desk: 'furnishing.desk',
  dressing_table: 'furnishing.dressingTable',
  sofa: 'furnishing.sofa',
  tv: 'furnishing.tv',
  range_hood: 'furnishing.rangeHood',
  water_heater: 'furnishing.waterHeater',
};

export default function FurnishingMultiSelect({
  value,
  onChange,
  open,
  onOpenChange,
  labelClassName,
  triggerClassName,
}: FurnishingMultiSelectProps) {
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
      ? t('properties.selectFurnishing')
      : value.map((item) => t(FURNISHING_LABEL_KEYS[item])).join(', ');

  function toggle(option: FurnishingValue) {
    if (selected.has(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div ref={rootRef} className="block">
      <span className={labelClassName}>{t('properties.filterFurnishing')}</span>
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
          {FURNISHING_VALUES.map((option) => {
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
                {t(FURNISHING_LABEL_KEYS[option])}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
