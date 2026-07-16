'use client';

import {
  filterLocationOptions,
  findHcmcDistrict,
  getHcmcStreets,
  getHcmcWards,
  HCMC_DISTRICTS,
} from '@/src/lib/hcmc-locations';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface HcmcLocationValue {
  districtCode: number | null;
  district: string;
  ward: string;
  street: string;
}

interface HcmcLocationSelectsProps {
  value: HcmcLocationValue;
  onChange: (value: HcmcLocationValue) => void;
  required?: boolean;
  disabled?: boolean;
  showLabels?: boolean;
  selectClassName?: string;
  labelClassName?: string;
  labels: {
    district: string;
    ward: string;
    street: string;
    allDistricts: string;
    allWards: string;
    allStreets: string;
    loadingDistricts: string;
    loadingWards: string;
    loadingStreets: string;
    selectDistrictFirst: string;
    selectWardFirst: string;
    noStreets: string;
  };
}

const EMPTY_VALUE: HcmcLocationValue = {
  districtCode: null,
  district: '',
  ward: '',
  street: '',
};

function SearchableLocationField({
  id,
  label,
  showLabel,
  value,
  options,
  placeholder,
  disabled,
  required,
  emptyMessage,
  className,
  labelClassName,
  onChange,
}: {
  id: string;
  label: string;
  showLabel: boolean;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage: string;
  className: string;
  labelClassName: string;
  onChange: (next: string) => void;
}) {
  const listId = `${id}-list`;
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [value]);

  const filtered = useMemo(
    () => filterLocationOptions(options, query),
    [options, query],
  );

  function commit(next: string) {
    onChange(next);
    setQuery(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex min-w-[10rem] flex-col gap-1.5">
      <label htmlFor={id} className={showLabel ? labelClassName : 'sr-only'}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        required={required && !value}
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setQuery(value);
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (filtered.length === 1) {
              commit(filtered[0]);
            } else if (
              filtered.some(
                (option) => option.toLowerCase() === query.trim().toLowerCase(),
              )
            ) {
              const exact = filtered.find(
                (option) =>
                  option.toLowerCase() === query.trim().toLowerCase(),
              );
              if (exact) commit(exact);
            }
          }
        }}
        className={className}
      />
      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className="flex w-full px-3 py-2 text-left text-sm text-[#6b7280] transition hover:bg-[#f3f4f6]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit('')}
            >
              {placeholder}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[#9ca3af]">{emptyMessage}</li>
          ) : (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={`flex w-full px-3 py-2 text-left text-sm transition hover:bg-[#f3f4f6] ${
                    option === value
                      ? 'bg-[#e8f3ed] font-medium text-[#1e4636]'
                      : 'text-[#1a1a1a]'
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(option)}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

export default function HcmcLocationSelects({
  value,
  onChange,
  required = false,
  disabled = false,
  showLabels = true,
  selectClassName,
  labelClassName,
  labels,
}: HcmcLocationSelectsProps) {
  const baseId = useId();
  const matchedDistrict = findHcmcDistrict(value.districtCode, value.district);
  const districtCode = matchedDistrict?.code ?? value.districtCode;
  const districtName = matchedDistrict?.name ?? value.district;
  const wards = getHcmcWards(districtCode, districtName);
  const streets = getHcmcStreets(districtCode, districtName);
  const hasDistrict = Boolean(matchedDistrict);

  useEffect(() => {
    if (!matchedDistrict) return;
    if (
      value.districtCode === matchedDistrict.code &&
      value.district === matchedDistrict.name
    ) {
      return;
    }
    onChange({
      ...value,
      districtCode: matchedDistrict.code,
      district: matchedDistrict.name,
    });
    // Sync canonical district fields when loading an existing property.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedDistrict?.code, matchedDistrict?.name]);

  function handleDistrictChange(nextName: string) {
    const selected = HCMC_DISTRICTS.find(
      (district) => district.name === nextName,
    );
    onChange({
      districtCode: selected?.code ?? null,
      district: selected?.name ?? '',
      ward: '',
      street: '',
    });
  }

  function handleWardChange(nextName: string) {
    onChange({
      ...value,
      districtCode: matchedDistrict?.code ?? value.districtCode,
      district: matchedDistrict?.name ?? value.district,
      ward: nextName,
      street: '',
    });
  }

  function handleStreetChange(nextName: string) {
    onChange({
      ...value,
      street: nextName,
    });
  }

  const fieldClassName =
    selectClassName ??
    'w-full rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2.5 text-sm font-medium text-[#1a1a1a] outline-none transition focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10 disabled:cursor-not-allowed disabled:opacity-60';

  const fieldLabelClassName = labelClassName ?? 'text-sm text-[#6b7280]';

  return (
    <div className="contents">
      <label className="flex min-w-[10rem] flex-col gap-1.5">
        <span className={showLabels ? fieldLabelClassName : 'sr-only'}>
          {labels.district}
        </span>
        <select
          value={matchedDistrict?.name ?? ''}
          required={required}
          disabled={disabled}
          onChange={(event) => handleDistrictChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">{labels.allDistricts}</option>
          {HCMC_DISTRICTS.map((district) => (
            <option key={district.code} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </label>

      <SearchableLocationField
        id={`${baseId}-ward`}
        label={labels.ward}
        showLabel={showLabels}
        value={value.ward}
        options={wards}
        placeholder={
          !hasDistrict ? labels.selectDistrictFirst : labels.allWards
        }
        disabled={disabled || !hasDistrict}
        required={required}
        emptyMessage={labels.loadingWards}
        className={fieldClassName}
        labelClassName={fieldLabelClassName}
        onChange={handleWardChange}
      />

      <SearchableLocationField
        id={`${baseId}-street`}
        label={labels.street}
        showLabel={showLabels}
        value={value.street}
        options={streets}
        placeholder={
          !hasDistrict
            ? labels.selectDistrictFirst
            : streets.length === 0
              ? labels.noStreets
              : labels.allStreets
        }
        disabled={disabled || !hasDistrict}
        required={required}
        emptyMessage={labels.noStreets}
        className={fieldClassName}
        labelClassName={fieldLabelClassName}
        onChange={handleStreetChange}
      />
    </div>
  );
}

export { EMPTY_VALUE as EMPTY_HCMC_LOCATION };
