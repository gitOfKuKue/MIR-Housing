import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DISTRICTS_CACHE_TTL_MS,
  HCMC_PROVINCE_CODE,
  LOCATION_USER_AGENT,
  NOMINATIM_API_BASE,
  OVERPASS_API_URL,
  PROVINCES_API_BASE,
  STREETS_CACHE_TTL_MS,
  WARDS_CACHE_TTL_MS,
} from './location.constants';

export interface LocationOption {
  code?: number;
  name: string;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

interface ProvincesDistrict {
  name: string;
  code: number;
}

interface ProvincesWard {
  name: string;
  code: number;
}

interface NominatimResult {
  osm_type?: string;
  osm_id?: number;
  class?: string;
  type?: string;
  addresstype?: string;
  name?: string;
  display_name?: string;
  boundingbox?: [string, string, string, string];
}

interface OverpassElement {
  tags?: { name?: string; highway?: string };
}

type BBox = [number, number, number, number]; // south, west, north, east

const STREETS_EMPTY_CACHE_TTL_MS = 5 * 60 * 1000;
const HIGHWAY_FILTER =
  '^(primary|secondary|tertiary|residential|unclassified|living_street|trunk)$';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  async getDistricts(): Promise<LocationOption[]> {
    return this.getOrSet(
      'districts:hcmc',
      DISTRICTS_CACHE_TTL_MS,
      async () => {
        const url = `${PROVINCES_API_BASE}/p/${HCMC_PROVINCE_CODE}?depth=2`;
        const payload = await this.fetchJson<{
          districts?: ProvincesDistrict[];
        }>(url);

        const districts = (payload.districts ?? [])
          .map((district) => ({
            code: district.code,
            name: district.name,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        if (districts.length === 0) {
          throw new BadGatewayException(
            'No districts returned for Ho Chi Minh City',
          );
        }

        return districts;
      },
    );
  }

  async getWards(districtCode: number): Promise<LocationOption[]> {
    return this.getOrSet(
      `wards:${districtCode}`,
      WARDS_CACHE_TTL_MS,
      async () => {
        const url = `${PROVINCES_API_BASE}/d/${districtCode}?depth=2`;
        const payload = await this.fetchJson<{
          name?: string;
          wards?: ProvincesWard[];
        }>(url);

        if (!payload.name) {
          throw new NotFoundException(
            `District with code ${districtCode} was not found`,
          );
        }

        return (payload.wards ?? [])
          .map((ward) => ({
            code: ward.code,
            name: ward.name,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      },
    );
  }

  async getStreets(
    ward: string,
    district: string,
    search?: string,
  ): Promise<LocationOption[]> {
    const wardName = ward.trim();
    const districtName = district.trim();
    const cacheKey = `streets:v2:${districtName}|${wardName}`;

    const streets = await this.getOrSet(
      cacheKey,
      STREETS_CACHE_TTL_MS,
      async () => {
        const names = await this.fetchStreetsForWard(wardName, districtName);
        return names.map((name) => ({ name }));
      },
      (value) => (value.length === 0 ? STREETS_EMPTY_CACHE_TTL_MS : undefined),
    );

    const term = search?.trim().toLowerCase();
    if (!term) {
      return streets;
    }

    return streets.filter((street) =>
      street.name.toLowerCase().includes(term),
    );
  }

  /**
   * Resolve streets for a ward inside a district:
   * 1) Nominatim ward place → Overpass by OSM area id or ward bbox
   * 2) Overpass area query by ward name scoped under district
   * 3) District bbox as last resort (still for the selected district)
   */
  private async fetchStreetsForWard(
    ward: string,
    district: string,
  ): Promise<string[]> {
    const wardPlace = await this.resolveWardPlace(ward, district);

    if (wardPlace?.areaId) {
      const byArea = await this.fetchStreetNamesInOverpassArea(wardPlace.areaId);
      if (byArea.length > 0) {
        this.logger.log(
          `Streets for ${ward}, ${district}: ${byArea.length} via OSM area ${wardPlace.areaId}`,
        );
        return byArea;
      }
    }

    if (wardPlace?.bbox) {
      const byWardBbox = await this.fetchStreetNamesInBbox(wardPlace.bbox);
      if (byWardBbox.length > 0) {
        this.logger.log(
          `Streets for ${ward}, ${district}: ${byWardBbox.length} via ward bbox`,
        );
        return byWardBbox;
      }
    }

    const byNamedAreas = await this.fetchStreetNamesInNamedAreas(ward, district);
    if (byNamedAreas.length > 0) {
      this.logger.log(
        `Streets for ${ward}, ${district}: ${byNamedAreas.length} via named Overpass areas`,
      );
      return byNamedAreas;
    }

    const districtPlace = await this.resolveDistrictPlace(district);
    if (districtPlace?.bbox) {
      const byDistrict = await this.fetchStreetNamesInBbox(districtPlace.bbox);
      this.logger.warn(
        `Fell back to district streets for ${ward}, ${district}: ${byDistrict.length}`,
      );
      return byDistrict;
    }

    this.logger.warn(`No streets found for ${ward}, ${district}`);
    return [];
  }

  private async resolveWardPlace(
    ward: string,
    district: string,
  ): Promise<{ areaId: number | null; bbox: BBox | null } | null> {
    const queries = [
      `${ward}, ${district}, Thành phố Hồ Chí Minh, Việt Nam`,
      `${ward}, ${district}, Hồ Chí Minh, Việt Nam`,
      `${ward}, ${district}, Hồ Chí Minh`,
      `${ward}, ${district}`,
    ];

    for (const query of queries) {
      const results = await this.searchNominatim(query);
      const match = this.pickBestPlace(results, { ward, district });
      if (!match) continue;

      return {
        areaId: this.toOverpassAreaId(match.osm_type, match.osm_id),
        bbox: this.parseBoundingBox(match.boundingbox),
      };
    }

    return null;
  }

  private async resolveDistrictPlace(
    district: string,
  ): Promise<{ bbox: BBox | null } | null> {
    const queries = [
      `${district}, Thành phố Hồ Chí Minh, Việt Nam`,
      `${district}, Hồ Chí Minh, Việt Nam`,
      `${district}, Hồ Chí Minh`,
    ];

    for (const query of queries) {
      const results = await this.searchNominatim(query);
      const match = this.pickBestPlace(results, { district });
      if (!match) continue;

      return { bbox: this.parseBoundingBox(match.boundingbox) };
    }

    return null;
  }

  private pickBestPlace(
    results: NominatimResult[],
    required: { ward?: string; district: string },
  ): NominatimResult | null {
    if (results.length === 0) return null;

    const districtNeedle = this.normalize(required.district);
    const wardNeedle = required.ward ? this.normalize(required.ward) : null;

    const scored = results
      .map((result) => {
        const haystack = this.normalize(
          `${result.name ?? ''} ${result.display_name ?? ''}`,
        );
        let score = 0;

        if (districtNeedle && haystack.includes(districtNeedle)) score += 4;
        if (wardNeedle && haystack.includes(wardNeedle)) score += 6;
        if (
          result.class === 'boundary' ||
          result.type === 'historic' ||
          result.addresstype === 'suburb' ||
          result.addresstype === 'quarter' ||
          result.addresstype === 'city_district' ||
          result.addresstype === 'borough' ||
          result.addresstype === 'neighbourhood'
        ) {
          score += 3;
        }
        if (result.boundingbox) score += 1;
        if (this.toOverpassAreaId(result.osm_type, result.osm_id)) score += 2;

        // Prefer Vietnam results.
        if (this.normalize(result.display_name ?? '').includes('viet')) {
          score += 1;
        }

        return { result, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored[0]?.result ?? results[0] ?? null;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFC')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private toOverpassAreaId(
    osmType?: string,
    osmId?: number,
  ): number | null {
    if (!osmType || osmId == null) return null;
    if (osmType === 'relation') return 3_600_000_000 + osmId;
    if (osmType === 'way') return 2_400_000_000 + osmId;
    return null;
  }

  private async searchNominatim(query: string): Promise<NominatimResult[]> {
    const url = new URL(`${NOMINATIM_API_BASE}/search`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '8');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'vn');
    url.searchParams.set('q', query);

    try {
      const results = await this.fetchJson<NominatimResult[]>(url.toString());
      return Array.isArray(results) ? results : [];
    } catch (error) {
      this.logger.warn(`Nominatim search failed for "${query}"`, error);
      return [];
    }
  }

  private parseBoundingBox(
    boundingbox?: [string, string, string, string],
  ): BBox | null {
    if (!boundingbox || boundingbox.length !== 4) {
      return null;
    }

    const [south, north, west, east] = boundingbox.map(Number);
    if ([south, north, west, east].some((value) => Number.isNaN(value))) {
      return null;
    }

    return [south, west, north, east];
  }

  private async fetchStreetNamesInOverpassArea(
    areaId: number,
  ): Promise<string[]> {
    const query = `
[out:json][timeout:30];
area(${areaId})->.searchArea;
(
  way["highway"~"${HIGHWAY_FILTER}"]["name"](area.searchArea);
);
out tags;
`.trim();

    return this.runOverpassStreetQuery(query);
  }

  private async fetchStreetNamesInNamedAreas(
    ward: string,
    district: string,
  ): Promise<string[]> {
    const safeWard = this.escapeOverpassString(ward);
    const safeDistrict = this.escapeOverpassString(district);

    const query = `
[out:json][timeout:30];
area["name"="${safeDistrict}"]["boundary"="administrative"]->.district;
(
  area["name"="${safeWard}"]["boundary"="administrative"](area.district);
  area["name"="${safeWard}"]["boundary"="historic"](area.district);
)->.ward;
(
  way["highway"~"${HIGHWAY_FILTER}"]["name"](area.ward);
);
out tags;
`.trim();

    return this.runOverpassStreetQuery(query);
  }

  private async fetchStreetNamesInBbox(bbox: BBox): Promise<string[]> {
    const [south, west, north, east] = bbox;
    const query = `
[out:json][timeout:30];
(
  way["highway"~"${HIGHWAY_FILTER}"]["name"](${south},${west},${north},${east});
);
out tags;
`.trim();

    return this.runOverpassStreetQuery(query);
  }

  private async runOverpassStreetQuery(query: string): Promise<string[]> {
    let response: Response;

    try {
      response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': LOCATION_USER_AGENT,
        },
        body: new URLSearchParams({ data: query }).toString(),
      });
    } catch (error) {
      this.logger.warn('Overpass request failed', error);
      return [];
    }

    if (!response.ok) {
      this.logger.warn(`Overpass request failed: ${response.status}`);
      return [];
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) {
      this.logger.warn('Overpass returned non-JSON response');
      return [];
    }

    const payload = (await response.json()) as {
      elements?: OverpassElement[];
    };

    const names = new Set<string>();
    for (const element of payload.elements ?? []) {
      const name = element.tags?.name?.trim();
      if (!name) continue;
      if (/^Hẻm\b/i.test(name) || /^Hem\b/i.test(name)) continue;
      names.add(name);
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b, 'vi'));
  }

  private escapeOverpassString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private async fetchJson<T>(url: string): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': LOCATION_USER_AGENT,
        },
      });
    } catch (error) {
      this.logger.error(`Location provider request failed: ${url}`, error);
      throw new BadGatewayException('Location provider is unreachable');
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `Location provider returned ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  private async getOrSet<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
    resolveTtl?: (value: T) => number | undefined,
  ): Promise<T> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = await loader();
    const effectiveTtl = resolveTtl?.(value) ?? ttlMs;
    this.cache.set(key, { value, expiresAt: Date.now() + effectiveTtl });
    return value;
  }
}
