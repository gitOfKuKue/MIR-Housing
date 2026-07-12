'use client';

import {
  getDistricts,
  getStreets,
  getWards,
  type LocationOption,
} from '@/src/lib/api';
import { useEffect, useState } from 'react';

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
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [streets, setStreets] = useState<LocationOption[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDistricts() {
      setLoadingDistricts(true);
      setError('');
      try {
        const data = await getDistricts();
        if (!cancelled) {
          setDistricts(data);

          if (value.district && !value.districtCode) {
            const matched = data.find(
              (district) => district.name === value.district,
            );
            if (matched?.code != null) {
              onChange({
                ...value,
                districtCode: matched.code,
              });
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load districts',
          );
          setDistricts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDistricts(false);
        }
      }
    }

    loadDistricts();
    return () => {
      cancelled = true;
    };
    // Only hydrate district code once districts are available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWards() {
      if (!value.districtCode) {
        setWards([]);
        return;
      }

      setLoadingWards(true);
      setError('');
      try {
        const data = await getWards(value.districtCode);
        if (!cancelled) {
          setWards(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load wards');
          setWards([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingWards(false);
        }
      }
    }

    loadWards();
    return () => {
      cancelled = true;
    };
  }, [value.districtCode]);

  useEffect(() => {
    let cancelled = false;

    async function loadStreets() {
      if (!value.district || !value.ward) {
        setStreets([]);
        setLoadingStreets(false);
        return;
      }

      setLoadingStreets(true);
      setStreets([]);
      setError('');
      try {
        const data = await getStreets({
          district: value.district,
          ward: value.ward,
        });
        if (!cancelled) {
          setStreets(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load streets',
          );
          setStreets([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStreets(false);
        }
      }
    }

    loadStreets();
    return () => {
      cancelled = true;
    };
  }, [value.district, value.ward]);

  function handleDistrictChange(nextName: string) {
    const selected = districts.find((district) => district.name === nextName);
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

  const fieldLabelClassName =
    labelClassName ?? 'text-sm text-[#6b7280]';

  return (
    <div className="contents">
      <label className="flex min-w-[10rem] flex-col gap-1.5">
        <span className={showLabels ? fieldLabelClassName : 'sr-only'}>
          {labels.district}
        </span>
        <select
          value={value.district}
          required={required}
          disabled={disabled || loadingDistricts}
          onChange={(event) => handleDistrictChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">
            {loadingDistricts ? labels.loadingDistricts : labels.allDistricts}
          </option>
          {districts.map((district) => (
            <option key={district.code ?? district.name} value={district.name}>
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
          disabled={disabled || !value.districtCode || loadingWards}
          onChange={(event) => handleWardChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">
            {!value.districtCode
              ? labels.selectDistrictFirst
              : loadingWards
                ? labels.loadingWards
                : labels.allWards}
          </option>
          {wards.map((ward) => (
            <option key={ward.code ?? ward.name} value={ward.name}>
              {ward.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-col gap-1.5">
        <span className={showLabels ? fieldLabelClassName : 'sr-only'}>
          {labels.street}
        </span>
        <select
          value={value.street}
          required={required}
          disabled={disabled || !value.ward || loadingStreets}
          onChange={(event) => handleStreetChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">
            {!value.ward
              ? labels.selectWardFirst
              : loadingStreets
                ? labels.loadingStreets
                : streets.length === 0
                  ? labels.noStreets
                  : labels.allStreets}
          </option>
          {streets.map((street) => (
            <option key={street.name} value={street.name}>
              {street.name}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p className="col-span-full text-xs text-red-600 sm:col-span-3">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { EMPTY_VALUE as EMPTY_HCMC_LOCATION };
