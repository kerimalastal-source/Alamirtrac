// Visits by place on the statistics page (same grouping as hadarahospitality):
// continents first, then the regions inside each (the Gulf, the Balkans,
// Western Europe…), and each region's countries under it. Country codes are
// the ISO 3166 codes Vercel's geolocation sends (x-vercel-ip-country).

export type Continent = 'asia' | 'europe' | 'africa' | 'northAmerica' | 'southAmerica' | 'oceania' | 'unknown';

export type Region =
  | 'gulf'
  | 'middleEast'
  | 'caucasus'
  | 'southAsia'
  | 'eastAsia'
  | 'balkans'
  | 'westernEurope'
  | 'northernEurope'
  | 'southernEurope'
  | 'easternEurope'
  | 'northAfrica'
  | 'subSaharanAfrica'
  | 'northAmericaMain'
  | 'centralAmerica'
  | 'southAmerica'
  | 'oceania'
  | 'unknown';

/** Each region, its continent and its countries. Türkiye is listed with the Middle East. */
const REGIONS: { region: Region; continent: Continent; codes: string }[] = [
  { region: 'gulf', continent: 'asia', codes: 'SA AE QA KW BH OM' },
  { region: 'middleEast', continent: 'asia', codes: 'TR IQ JO LB SY PS IL YE IR' },
  { region: 'caucasus', continent: 'asia', codes: 'GE AM AZ KZ UZ TM KG TJ' },
  { region: 'southAsia', continent: 'asia', codes: 'IN PK BD LK NP BT MV AF' },
  { region: 'eastAsia', continent: 'asia', codes: 'CN JP KR KP MN TW HK MO TH VN MY SG ID PH MM KH LA BN TL' },
  { region: 'balkans', continent: 'europe', codes: 'RS BA ME MK AL XK HR SI BG RO GR' },
  { region: 'westernEurope', continent: 'europe', codes: 'GB IE FR BE NL LU DE AT CH MC LI' },
  { region: 'northernEurope', continent: 'europe', codes: 'DK SE NO FI IS EE LV LT FO AX' },
  { region: 'southernEurope', continent: 'europe', codes: 'IT ES PT MT CY SM VA AD GI' },
  { region: 'easternEurope', continent: 'europe', codes: 'PL CZ SK HU UA BY RU MD' },
  { region: 'northAfrica', continent: 'africa', codes: 'EG LY TN DZ MA SD EH' },
  {
    region: 'subSaharanAfrica',
    continent: 'africa',
    codes:
      'AO BJ BW BF BI CM CV CF TD KM CG CD CI DJ GQ ER SZ ET GA GM GH GN GW KE LS LR MG MW ML MR MU MZ NA NE NG RW ST SN SC SL SO ZA SS TZ TG UG ZM ZW RE YT',
  },
  { region: 'northAmericaMain', continent: 'northAmerica', codes: 'US CA MX GL PM BM' },
  {
    region: 'centralAmerica',
    continent: 'northAmerica',
    codes: 'GT BZ SV HN NI CR PA CU JM HT DO PR BS BB TT AG DM GD KN LC VC AW CW BQ SX MF BL GP MQ KY VG VI TC AI MS',
  },
  { region: 'southAmerica', continent: 'southAmerica', codes: 'CO VE GY SR GF EC PE BR BO PY CL AR UY FK' },
  { region: 'oceania', continent: 'oceania', codes: 'AU NZ FJ PG SB VU NC PF WS TO KI TV NR FM MH PW GU MP AS CK NU' },
];

const BY_CODE = new Map<string, { region: Region; continent: Continent }>();
for (const r of REGIONS) for (const code of r.codes.split(' ')) BY_CODE.set(code, { region: r.region, continent: r.continent });

/** Where a country sits; an unknown or missing code is "unknown". */
export function placeOf(code: string | null | undefined): { region: Region; continent: Continent } {
  return (code && BY_CODE.get(code.toUpperCase())) || { region: 'unknown', continent: 'unknown' };
}

export interface CountryVisits {
  country: string;
  visits: number;
}

export interface RegionGroup {
  region: Region;
  visits: number;
  countries: CountryVisits[];
}

export interface ContinentGroup {
  continent: Continent;
  visits: number;
  regions: RegionGroup[];
}

const byVisits = <T extends { visits: number }>(a: T, b: T) => b.visits - a.visits;

/** Countries grouped into continents and regions, each level sorted by visits; "unknown" always last. */
export function groupByPlace(rows: CountryVisits[]): ContinentGroup[] {
  const continents = new Map<Continent, Map<Region, CountryVisits[]>>();
  for (const row of rows) {
    if (row.visits <= 0) continue;
    const { continent, region } = placeOf(row.country);
    const regions = continents.get(continent) ?? new Map<Region, CountryVisits[]>();
    const list = regions.get(region) ?? [];
    list.push({ country: row.country, visits: row.visits });
    regions.set(region, list);
    continents.set(continent, regions);
  }
  const groups = [...continents].map(([continent, regions]) => {
    const regionGroups = [...regions].map(([region, countries]) => ({
      region,
      visits: countries.reduce((n, c) => n + c.visits, 0),
      countries: countries.sort(byVisits),
    }));
    return { continent, visits: regionGroups.reduce((n, r) => n + r.visits, 0), regions: regionGroups.sort(byVisits) };
  });
  return groups.sort((a, b) => (a.continent === 'unknown' ? 1 : b.continent === 'unknown' ? -1 : byVisits(a, b)));
}

export const CONTINENT_LABEL: Record<Continent, string> = {
  asia: 'آسيا',
  europe: 'أوروبا',
  africa: 'أفريقيا',
  northAmerica: 'أمريكا الشمالية',
  southAmerica: 'أمريكا الجنوبية',
  oceania: 'أوقيانوسيا',
  unknown: 'غير معروف',
};

export const REGION_LABEL: Record<Region, string> = {
  gulf: 'دول الخليج',
  middleEast: 'الشرق الأوسط',
  caucasus: 'القوقاز وآسيا الوسطى',
  southAsia: 'جنوب آسيا',
  eastAsia: 'شرق آسيا وجنوبها الشرقي',
  balkans: 'البلقان',
  westernEurope: 'أوروبا الغربية',
  northernEurope: 'شمال أوروبا',
  southernEurope: 'جنوب أوروبا',
  easternEurope: 'شرق أوروبا',
  northAfrica: 'شمال أفريقيا',
  subSaharanAfrica: 'أفريقيا جنوب الصحراء',
  northAmericaMain: 'الولايات المتحدة وكندا والمكسيك',
  centralAmerica: 'أمريكا الوسطى والكاريبي',
  southAmerica: 'أمريكا الجنوبية',
  oceania: 'أوقيانوسيا',
  unknown: 'غير معروف',
};
