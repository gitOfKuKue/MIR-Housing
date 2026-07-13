'use client';

import {
  findHcmcDistrict,
  getHcmcStreets,
  getHcmcWards,
  HCMC_DISTRICTS,
} from '@/src/lib/hcmc-locations';
import { useEffect } from 'react';

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

      <label className="flex min-w-[10rem] flex-col gap-1.5">
        <span className={showLabels ? fieldLabelClassName : 'sr-only'}>
          {labels.ward}
        </span>
        <select
          value={value.ward}
          required={required}
          disabled={disabled || !hasDistrict}
          onChange={(event) => handleWardChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">
            {!hasDistrict ? labels.selectDistrictFirst : labels.allWards}
          </option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-col gap-1.5">
        <span className={showLabels ? fieldLabelClassName : 'sr-only'}>
          {labels.street}
        </span>
        <select
          value={
            value.street && streets.includes(value.street) ? value.street : ''
          }
          required={required}
          disabled={disabled || !value.ward}
          onChange={(event) => handleStreetChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">
            {!value.ward
              ? labels.selectWardFirst
              : streets.length === 0
                ? labels.noStreets
                : labels.allStreets}
          </option>
          {streets.map((street) => (
            <option key={street} value={street}>
              {street}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export { EMPTY_VALUE as EMPTY_HCMC_LOCATION };
