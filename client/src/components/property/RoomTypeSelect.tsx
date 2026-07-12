'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  ROOM_TYPE_VALUES,
  type RoomTypeValue,
} from '@/src/lib/room-types';
import { useEffect, useId, useRef, useState } from 'react';

export type RoomTypeFilterValue = RoomTypeValue | 'all';

interface RoomTypeSelectProps {
  value: RoomTypeFilterValue;
  onChange: (value: RoomTypeFilterValue) => void;
  labelClassName?: string;
  triggerClassName?: string;
}

export const ROOM_TYPE_LABEL_KEYS: Record<RoomTypeValue, TranslationKey> = {
  studio: 'roomType.studio',
  duplex: 'roomType.duplex',
  '1_bedroom': 'roomType.1Bedroom',
  '2_bedroom': 'roomType.2Bedroom',
  private_kitchen: 'roomType.privateKitchen',
  commercial_space: 'roomType.commercialSpace',
  ground_plus_one: 'roomType.groundPlusOne',
  kiosk: 'roomType.kiosk',
  sleepbox: 'roomType.sleepbox',
  dormitory: 'roomType.dormitory',
  foreigner_apartment: 'roomType.foreignerApartment',
  mini_apartment: 'roomType.miniApartment',
};

export default function RoomTypeSelect({
  value,
  onChange,
  labelClassName,
  triggerClassName,
}: RoomTypeSelectProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const groupName = useId();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const summary =
    value === 'all'
      ? t('properties.allRoomTypes')
      : t(ROOM_TYPE_LABEL_KEYS[value]);

  function selectValue(next: RoomTypeFilterValue) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className={labelClassName}>{t('properties.filterRoomType')}</span>
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
        <span className="truncate">{summary}</span>
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
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f9fafb]">
            <input
              type="radio"
              name={groupName}
              checked={value === 'all'}
              onChange={() => selectValue('all')}
              className="h-4 w-4 border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
            />
            {t('properties.allRoomTypes')}
          </label>

          <div className="my-1 border-t border-[#f3f4f6]" />

          {ROOM_TYPE_VALUES.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f9fafb]"
            >
              <input
                type="radio"
                name={groupName}
                checked={value === option}
                onChange={() => selectValue(option)}
                className="h-4 w-4 border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
              />
              {t(ROOM_TYPE_LABEL_KEYS[option])}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
