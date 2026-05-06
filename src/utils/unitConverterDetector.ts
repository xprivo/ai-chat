export type UnitCategory = 'temperature' | 'distance' | 'speed' | 'weight' | 'volume';

export interface UnitDef {
  id: string;
  label: string;
  symbol: string;
}

export interface UnitGroup {
  category: UnitCategory;
  units: UnitDef[];
  toBase: (value: number, fromUnit: string) => number;
  fromBase: (value: number, toUnit: string) => number;
}

export const UNIT_GROUPS: Record<UnitCategory, UnitGroup> = {
  temperature: {
    category: 'temperature',
    units: [
      { id: 'celsius', label: 'Celsius', symbol: '°C' },
      { id: 'fahrenheit', label: 'Fahrenheit', symbol: '°F' },
      { id: 'kelvin', label: 'Kelvin', symbol: 'K' },
    ],
    toBase: (v, from) => {
      if (from === 'celsius') return v;
      if (from === 'fahrenheit') return (v - 32) * 5 / 9;
      if (from === 'kelvin') return v - 273.15;
      return v;
    },
    fromBase: (v, to) => {
      if (to === 'celsius') return v;
      if (to === 'fahrenheit') return v * 9 / 5 + 32;
      if (to === 'kelvin') return v + 273.15;
      return v;
    },
  },
  distance: {
    category: 'distance',
    units: [
      { id: 'meter', label: 'Meter', symbol: 'm' },
      { id: 'kilometer', label: 'Kilometer', symbol: 'km' },
      { id: 'centimeter', label: 'Centimeter', symbol: 'cm' },
      { id: 'millimeter', label: 'Millimeter', symbol: 'mm' },
      { id: 'mile', label: 'Mile', symbol: 'mi' },
      { id: 'yard', label: 'Yard', symbol: 'yd' },
      { id: 'foot', label: 'Foot', symbol: 'ft' },
      { id: 'inch', label: 'Inch', symbol: 'in' },
      { id: 'nautical_mile', label: 'Nautical Mile', symbol: 'nmi' },
      { id: 'light_year', label: 'Light Year', symbol: 'ly' },
    ],
    toBase: (v, from) => {
      const factors: Record<string, number> = {
        meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
        mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254,
        nautical_mile: 1852, light_year: 9.461e15,
      };
      return v * (factors[from] ?? 1);
    },
    fromBase: (v, to) => {
      const factors: Record<string, number> = {
        meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
        mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254,
        nautical_mile: 1852, light_year: 9.461e15,
      };
      return v / (factors[to] ?? 1);
    },
  },
  speed: {
    category: 'speed',
    units: [
      { id: 'kmh', label: 'km/h', symbol: 'km/h' },
      { id: 'mph', label: 'mph', symbol: 'mph' },
      { id: 'ms', label: 'm/s', symbol: 'm/s' },
      { id: 'knot', label: 'Knot', symbol: 'kn' },
      { id: 'mach', label: 'Mach', symbol: 'M' },
      { id: 'fps', label: 'ft/s', symbol: 'ft/s' },
    ],
    toBase: (v, from) => {
      const toMs: Record<string, number> = {
        kmh: 1 / 3.6, mph: 0.44704, ms: 1, knot: 0.514444, mach: 340.29, fps: 0.3048,
      };
      return v * (toMs[from] ?? 1);
    },
    fromBase: (v, to) => {
      const toMs: Record<string, number> = {
        kmh: 1 / 3.6, mph: 0.44704, ms: 1, knot: 0.514444, mach: 340.29, fps: 0.3048,
      };
      return v / (toMs[to] ?? 1);
    },
  },
  weight: {
    category: 'weight',
    units: [
      { id: 'kilogram', label: 'Kilogram', symbol: 'kg' },
      { id: 'gram', label: 'Gram', symbol: 'g' },
      { id: 'milligram', label: 'Milligram', symbol: 'mg' },
      { id: 'pound', label: 'Pound', symbol: 'lb' },
      { id: 'ounce', label: 'Ounce', symbol: 'oz' },
      { id: 'ton', label: 'Metric Ton', symbol: 't' },
      { id: 'stone', label: 'Stone', symbol: 'st' },
    ],
    toBase: (v, from) => {
      const toKg: Record<string, number> = {
        kilogram: 1, gram: 0.001, milligram: 1e-6, pound: 0.453592,
        ounce: 0.0283495, ton: 1000, stone: 6.35029,
      };
      return v * (toKg[from] ?? 1);
    },
    fromBase: (v, to) => {
      const toKg: Record<string, number> = {
        kilogram: 1, gram: 0.001, milligram: 1e-6, pound: 0.453592,
        ounce: 0.0283495, ton: 1000, stone: 6.35029,
      };
      return v / (toKg[to] ?? 1);
    },
  },
  volume: {
    category: 'volume',
    units: [
      { id: 'liter', label: 'Liter', symbol: 'L' },
      { id: 'milliliter', label: 'Milliliter', symbol: 'mL' },
      { id: 'gallon_us', label: 'Gallon (US)', symbol: 'gal' },
      { id: 'gallon_uk', label: 'Gallon (UK)', symbol: 'gal UK' },
      { id: 'pint', label: 'Pint (US)', symbol: 'pt' },
      { id: 'cup', label: 'Cup (US)', symbol: 'cup' },
      { id: 'fluid_oz', label: 'Fluid Ounce', symbol: 'fl oz' },
      { id: 'cubic_meter', label: 'Cubic Meter', symbol: 'm³' },
      { id: 'cubic_foot', label: 'Cubic Foot', symbol: 'ft³' },
    ],
    toBase: (v, from) => {
      const toL: Record<string, number> = {
        liter: 1, milliliter: 0.001, gallon_us: 3.78541, gallon_uk: 4.54609,
        pint: 0.473176, cup: 0.236588, fluid_oz: 0.0295735,
        cubic_meter: 1000, cubic_foot: 28.3168,
      };
      return v * (toL[from] ?? 1);
    },
    fromBase: (v, to) => {
      const toL: Record<string, number> = {
        liter: 1, milliliter: 0.001, gallon_us: 3.78541, gallon_uk: 4.54609,
        pint: 0.473176, cup: 0.236588, fluid_oz: 0.0295735,
        cubic_meter: 1000, cubic_foot: 28.3168,
      };
      return v / (toL[to] ?? 1);
    },
  },
};

const EXPLICIT_CONVERT_VERBS = [
  'convert', 'converter', 'convertir', 'convertisseur', 'konvertieren', 'konvertiere', 
  'umrechnen', 'umrechner', 'ëmrechnen', 'convierta', 'conversor', 'convertire', 
  'convertitore', 'omrekenen', 'converteren', 'przelicz', 'przeliczyć', 'konwertuj', 
  'przelicznik', 'konvertera', 'omvandla', 'konverter', 'omregn', 'конвертиране', 
  'преобразуване', 'pretvori', 'konvertiraj', 'pretvornik', 'převést', 'převodník', 
  'μετατροπή', 'μετατροπέας'
];

const UNIT_ALIASES: Record<string, { category: UnitCategory; unit: string }> = {
  '°c': { category: 'temperature', unit: 'celsius' },
  'c': { category: 'temperature', unit: 'celsius' },
  celsius: { category: 'temperature', unit: 'celsius' },
  celcius: { category: 'temperature', unit: 'celsius' },
  centigrade: { category: 'temperature', unit: 'celsius' },
  '°f': { category: 'temperature', unit: 'fahrenheit' },
  'f': { category: 'temperature', unit: 'fahrenheit' },
  fahrenheit: { category: 'temperature', unit: 'fahrenheit' },
  kelvin: { category: 'temperature', unit: 'kelvin' },
  'k': { category: 'temperature', unit: 'kelvin' },
  grad: { category: 'temperature', unit: 'celsius' },
  grads: { category: 'temperature', unit: 'celsius' },
  'grad celsius': { category: 'temperature', unit: 'celsius' },
  'grad fahrenheit': { category: 'temperature', unit: 'fahrenheit' },

  m: { category: 'distance', unit: 'meter' },
  meter: { category: 'distance', unit: 'meter' },
  meters: { category: 'distance', unit: 'meter' },
  metre: { category: 'distance', unit: 'meter' },
  metres: { category: 'distance', unit: 'meter' },
  'metro': { category: 'distance', unit: 'meter' },
  'metros': { category: 'distance', unit: 'meter' },
  km: { category: 'distance', unit: 'kilometer' },
  kilometer: { category: 'distance', unit: 'kilometer' },
  kilometers: { category: 'distance', unit: 'kilometer' },
  kilometre: { category: 'distance', unit: 'kilometer' },
  kilometres: { category: 'distance', unit: 'kilometer' },
  'kilomètre': { category: 'distance', unit: 'kilometer' },
  kilómetro: { category: 'distance', unit: 'kilometer' },
  'kilómetros': { category: 'distance', unit: 'kilometer' },
  cm: { category: 'distance', unit: 'centimeter' },
  centimeter: { category: 'distance', unit: 'centimeter' },
  centimeters: { category: 'distance', unit: 'centimeter' },
  centimetre: { category: 'distance', unit: 'centimeter' },
  centimetres: { category: 'distance', unit: 'centimeter' },
  centímetro: { category: 'distance', unit: 'centimeter' },
  mm: { category: 'distance', unit: 'millimeter' },
  millimeter: { category: 'distance', unit: 'millimeter' },
  millimetre: { category: 'distance', unit: 'millimeter' },
  milímetro: { category: 'distance', unit: 'millimeter' },
  mi: { category: 'distance', unit: 'mile' },
  mile: { category: 'distance', unit: 'mile' },
  miles: { category: 'distance', unit: 'mile' },
  meile: { category: 'distance', unit: 'mile' },
  meilen: { category: 'distance', unit: 'mile' },
  milla: { category: 'distance', unit: 'mile' },
  millas: { category: 'distance', unit: 'mile' },
  mille: { category: 'distance', unit: 'mile' },
  yd: { category: 'distance', unit: 'yard' },
  yard: { category: 'distance', unit: 'yard' },
  yards: { category: 'distance', unit: 'yard' },
  ft: { category: 'distance', unit: 'foot' },
  foot: { category: 'distance', unit: 'foot' },
  feet: { category: 'distance', unit: 'foot' },
  fuß: { category: 'distance', unit: 'foot' },
  fuss: { category: 'distance', unit: 'foot' },
  pied: { category: 'distance', unit: 'foot' },
  pieds: { category: 'distance', unit: 'foot' },
  pie: { category: 'distance', unit: 'foot' },
  pies: { category: 'distance', unit: 'foot' },
  'in': { category: 'distance', unit: 'inch' },
  inch: { category: 'distance', unit: 'inch' },
  inches: { category: 'distance', unit: 'inch' },
  zoll: { category: 'distance', unit: 'inch' },
  pouce: { category: 'distance', unit: 'inch' },
  pulgada: { category: 'distance', unit: 'inch' },
  nmi: { category: 'distance', unit: 'nautical_mile' },
  'nautical mile': { category: 'distance', unit: 'nautical_mile' },
  'nautical miles': { category: 'distance', unit: 'nautical_mile' },
  'seemeile': { category: 'distance', unit: 'nautical_mile' },
  'ly': { category: 'distance', unit: 'light_year' },
  'light year': { category: 'distance', unit: 'light_year' },
  'light years': { category: 'distance', unit: 'light_year' },
  'lichtjahr': { category: 'distance', unit: 'light_year' },

  'km/h': { category: 'speed', unit: 'kmh' },
  kmh: { category: 'speed', unit: 'kmh' },
  kph: { category: 'speed', unit: 'kmh' },
  'kilometer per hour': { category: 'speed', unit: 'kmh' },
  'kilometers per hour': { category: 'speed', unit: 'kmh' },
  'kilometre per hour': { category: 'speed', unit: 'kmh' },
  'kilomètres par heure': { category: 'speed', unit: 'kmh' },
  'kilómetros por hora': { category: 'speed', unit: 'kmh' },
  'km/std': { category: 'speed', unit: 'kmh' },
  'kilometer pro stunde': { category: 'speed', unit: 'kmh' },
  mph: { category: 'speed', unit: 'mph' },
  'miles per hour': { category: 'speed', unit: 'mph' },
  'meilen pro stunde': { category: 'speed', unit: 'mph' },
  'millas por hora': { category: 'speed', unit: 'mph' },
  'miles à l\'heure': { category: 'speed', unit: 'mph' },
  'm/s': { category: 'speed', unit: 'ms' },
  'ms': { category: 'speed', unit: 'ms' },
  'meter per second': { category: 'speed', unit: 'ms' },
  'meters per second': { category: 'speed', unit: 'ms' },
  'metre per second': { category: 'speed', unit: 'ms' },
  'meter pro sekunde': { category: 'speed', unit: 'ms' },
  knot: { category: 'speed', unit: 'knot' },
  knots: { category: 'speed', unit: 'knot' },
  knoten: { category: 'speed', unit: 'knot' },
  nœud: { category: 'speed', unit: 'knot' },
  nudo: { category: 'speed', unit: 'knot' },
  kn: { category: 'speed', unit: 'knot' },
  mach: { category: 'speed', unit: 'mach' },
  'ft/s': { category: 'speed', unit: 'fps' },
  fps: { category: 'speed', unit: 'fps' },
  'feet per second': { category: 'speed', unit: 'fps' },

  kg: { category: 'weight', unit: 'kilogram' },
  kilogram: { category: 'weight', unit: 'kilogram' },
  kilograms: { category: 'weight', unit: 'kilogram' },
  kilogramm: { category: 'weight', unit: 'kilogram' },
  kilogramme: { category: 'weight', unit: 'kilogram' },
  kilogramo: { category: 'weight', unit: 'kilogram' },
  g: { category: 'weight', unit: 'gram' },
  gram: { category: 'weight', unit: 'gram' },
  grams: { category: 'weight', unit: 'gram' },
  gramm: { category: 'weight', unit: 'gram' },
  gramme: { category: 'weight', unit: 'gram' },
  gramo: { category: 'weight', unit: 'gram' },
  mg: { category: 'weight', unit: 'milligram' },
  milligram: { category: 'weight', unit: 'milligram' },
  milligramme: { category: 'weight', unit: 'milligram' },
  lb: { category: 'weight', unit: 'pound' },
  lbs: { category: 'weight', unit: 'pound' },
  pound: { category: 'weight', unit: 'pound' },
  pounds: { category: 'weight', unit: 'pound' },
  pfund: { category: 'weight', unit: 'pound' },
  livre: { category: 'weight', unit: 'pound' },
  libra: { category: 'weight', unit: 'pound' },
  oz: { category: 'weight', unit: 'ounce' },
  ounce: { category: 'weight', unit: 'ounce' },
  ounces: { category: 'weight', unit: 'ounce' },
  unze: { category: 'weight', unit: 'ounce' },
  once: { category: 'weight', unit: 'ounce' },
  onza: { category: 'weight', unit: 'ounce' },
  t: { category: 'weight', unit: 'ton' },
  ton: { category: 'weight', unit: 'ton' },
  tons: { category: 'weight', unit: 'ton' },
  tonne: { category: 'weight', unit: 'ton' },
  tonnen: { category: 'weight', unit: 'ton' },
  tonelada: { category: 'weight', unit: 'ton' },
  st: { category: 'weight', unit: 'stone' },
  stone: { category: 'weight', unit: 'stone' },
  stones: { category: 'weight', unit: 'stone' },

  l: { category: 'volume', unit: 'liter' },
  liter: { category: 'volume', unit: 'liter' },
  liters: { category: 'volume', unit: 'liter' },
  litre: { category: 'volume', unit: 'liter' },
  litres: { category: 'volume', unit: 'liter' },
  litro: { category: 'volume', unit: 'liter' },
  ml: { category: 'volume', unit: 'milliliter' },
  milliliter: { category: 'volume', unit: 'milliliter' },
  millilitre: { category: 'volume', unit: 'milliliter' },
  millilitro: { category: 'volume', unit: 'milliliter' },
  gal: { category: 'volume', unit: 'gallon_us' },
  gallon: { category: 'volume', unit: 'gallon_us' },
  gallons: { category: 'volume', unit: 'gallon_us' },
  gallone: { category: 'volume', unit: 'gallon_us' },
  galon: { category: 'volume', unit: 'gallon_us' },
  pint: { category: 'volume', unit: 'pint' },
  pints: { category: 'volume', unit: 'pint' },
  cup: { category: 'volume', unit: 'cup' },
  cups: { category: 'volume', unit: 'cup' },
  tasse: { category: 'volume', unit: 'cup' },
  'fl oz': { category: 'volume', unit: 'fluid_oz' },
  'fluid ounce': { category: 'volume', unit: 'fluid_oz' },
  'fluid ounces': { category: 'volume', unit: 'fluid_oz' },
  'm³': { category: 'volume', unit: 'cubic_meter' },
  'cubic meter': { category: 'volume', unit: 'cubic_meter' },
  'cubic metres': { category: 'volume', unit: 'cubic_meter' },
  'kubikmeter': { category: 'volume', unit: 'cubic_meter' },
  'ft³': { category: 'volume', unit: 'cubic_foot' },
  'cubic foot': { category: 'volume', unit: 'cubic_foot' },
  'cubic feet': { category: 'volume', unit: 'cubic_foot' },
};

const CONVERSION_KEYWORDS: Record<string, string[]> = {
  en: ['convert', 'to', 'in', 'into', 'how many', 'how much'],
  de: ['umrechnen', 'konvertieren', 'in', 'nach', 'wie viel', 'wieviel'],
  fr: ['convertir', 'en', 'vers', 'combien'],
  es: ['convertir', 'a', 'en', 'cuánto', 'cuanto'],
  it: ['convertire', 'in', 'verso', 'quanto'],
  pt: ['converter', 'para', 'em', 'quanto'],
  nl: ['omrekenen', 'naar', 'in', 'hoeveel'],
  pl: ['przeliczyć', 'na', 'w', 'ile'],
  lb: ['ëmrechnen', 'op', 'a'],
  sv: ['konvertera', 'till', 'i', 'hur många', 'hur mycket'],
  da: ['omregn', 'til', 'i', 'hvor mange', 'hvor meget'],
  bg: ['конвертиране', 'в', 'към', 'колко'],
  hr: ['pretvori', 'u', 'koliko'],
  cs: ['převést', 'na', 'do', 'kolik'],
  el: ['μετατροπή', 'σε', 'πόσο'],
  sl: ['pretvori', 'v', 'koliko']
};

const PREPS = [
  'to', 'in', 'into', 'en', 'nach', 'zu', 'à', 'pour', 'em', 'till', 'til',
  'naar', 'do', 'na', 'per', 'auf', 'for', 'vers', 'sur', 'von', 'a', 'в', 
  'към', 'u', 'se', 'v', 'aus'
];

export interface ParsedUnitConversion {
  fromUnit: string;
  toUnit: string;
  fromUnitId: string;
  toUnitId: string;
  category: UnitCategory;
  amount: number | null;
}

function normalizeUnit(raw: string): { category: UnitCategory; unit: string } | null {
  const lower = raw.toLowerCase().trim();
  return UNIT_ALIASES[lower] ?? null;
}

const CONV_PREFIXES = [
  'convert ', 'convertir ', 'convertire ', 'konvertieren ', 'umrechnen ',
  'konvertera ', 'omvandla ', 'omrekenen ', 'przelicz ', 'converter ',
  'pretvori ', 'převést ', 'μετατροπή ', 'конвертиране '
];

export function parseUnitConversionQuery(query: string): ParsedUnitConversion | null {
  if (!query?.trim()) return null;
  let clean = query.trim().toLowerCase();

  for (const pfx of CONV_PREFIXES) {
    if (clean.startsWith(pfx.trim())) {
      clean = clean.slice(pfx.trim().length).trim();
      break;
    }
  }

  const sortedPreps = [...PREPS].sort((a, b) => b.length - a.length);

  for (const prep of sortedPreps) {
    const re = new RegExp(`^(.+?)\\s+${prep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(.+)$`, 'i');
    const m = clean.match(re);
    if (!m) continue;

    let leftPart = m[1].trim();
    let rightPart = m[2].trim();

    let amount: number | null = null;
    const amtMatch = leftPart.match(/^(\d+(?:[.,]\d+)?(?:\s*[kKmMbB])?)\s+(.+)$/);
    if (amtMatch) {
      amount = parseFloat(amtMatch[1].replace(',', '.'));
      leftPart = amtMatch[2].trim();
    }

    const fromDef = normalizeUnit(leftPart);
    const toDef = normalizeUnit(rightPart);

    if (fromDef && toDef && fromDef.category === toDef.category) {
      return {
        fromUnit: leftPart,
        toUnit: rightPart,
        fromUnitId: fromDef.unit,
        toUnitId: toDef.unit,
        category: fromDef.category,
        amount,
      };
    }
  }

  const justTwoUnits = clean.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z°\/²³ .]+?)\s+([a-zA-Z°\/²³ .]+)$/);
  if (justTwoUnits) {
    const amount = parseFloat(justTwoUnits[1].replace(',', '.'));
    const fromDef = normalizeUnit(justTwoUnits[2].trim());
    const toDef = normalizeUnit(justTwoUnits[3].trim());
    if (fromDef && toDef && fromDef.category === toDef.category) {
      return {
        fromUnit: justTwoUnits[2].trim(),
        toUnit: justTwoUnits[3].trim(),
        fromUnitId: fromDef.unit,
        toUnitId: toDef.unit,
        category: fromDef.category,
        amount,
      };
    }
  }

  return null;
}

const UNIT_CATEGORY_KEYWORDS: Record<UnitCategory, Record<string, string[]>> = {
  temperature: {
    en: ['temperature', 'degrees', 'degree', 'celsius', 'fahrenheit', 'kelvin'],
    de: ['temperatur', 'grad', 'celsius', 'fahrenheit', 'kelvin'],
    fr: ['température', 'degrés', 'degré', 'celsius', 'fahrenheit', 'kelvin'],
    es: ['temperatura', 'grados', 'grado', 'celsius', 'fahrenheit', 'kelvin'],
    it: ['temperatura', 'gradi', 'grado', 'celsius', 'fahrenheit', 'kelvin'],
    pt: ['temperatura', 'graus', 'celsius', 'fahrenheit', 'kelvin'],
    nl: ['temperatuur', 'graden', 'graad', 'celsius', 'fahrenheit'],
    pl: ['temperatura', 'stopni', 'celsius', 'fahrenheit', 'kelwin'],
    lb: ['temperatur', 'grad', 'celsius', 'fahrenheit'],
    sv: ['temperatur', 'grader', 'grad', 'celsius', 'fahrenheit', 'kelvin'],
    da: ['temperatur', 'grader', 'grad', 'celsius', 'fahrenheit', 'kelvin'],
    bg: ['температура', 'градуса', 'градус', 'целзий', 'фаренхайт', 'келвин'],
    hr: ['temperatura', 'stupnjevi', 'stupanj', 'celzijus', 'fahrenheit', 'kelvin'],
    cs: ['teplota', 'stupně', 'stupeň', 'celsius', 'fahrenheit', 'kelvin'],
    el: ['θερμοκρασία', 'βαθμοί', 'βαθμός', 'κελσίου', 'φαρενάιτ', 'κέλβιν'],
    sl: ['temperatura', 'stopinje', 'stopinja', 'celzij', 'fahrenheit', 'kelvin']
  },
  distance: {
    en: ['distance', 'length', 'height', 'width', 'meter', 'metre', 'mile', 'kilometer', 'foot', 'feet', 'inch', 'yard'],
    de: ['entfernung', 'länge', 'höhe', 'breite', 'meter', 'meile', 'kilometer', 'fuß', 'zoll', 'yard'],
    fr: ['distance', 'longueur', 'hauteur', 'largeur', 'mètre', 'mile', 'kilomètre', 'pied', 'pouce'],
    es: ['distancia', 'longitud', 'altura', 'ancho', 'metro', 'milla', 'kilómetro', 'pie', 'pulgada'],
    it: ['distanza', 'lunghezza', 'altezza', 'larghezza', 'metro', 'miglio', 'chilometro', 'piede', 'pollice'],
    pt: ['distância', 'comprimento', 'altura', 'largura', 'metro', 'milha', 'quilómetro'],
    nl: ['afstand', 'lengte', 'hoogte', 'breedte', 'meter', 'mijl', 'kilometer'],
    pl: ['odległość', 'długość', 'wysokość', 'szerokość', 'metr', 'mila', 'kilometr'],
    lb: ['distanz', 'längt', 'héicht', 'meter', 'kilometer', 'meile'],
    sv: ['avstånd', 'längd', 'höjd', 'bredd', 'meter', 'mil', 'kilometer', 'fot', 'tum'],
    da: ['afstand', 'længde', 'højde', 'bredde', 'meter', 'mil', 'kilometer', 'fod', 'tomme'],
    bg: ['разстояние', 'дължина', 'височина', 'ширина', 'метър', 'миля', 'километър'],
    hr: ['udaljenost', 'duljina', 'visina', 'širina', 'metar', 'milja', 'kilometar'],
    cs: ['vzdálenost', 'délka', 'výška', 'šířka', 'metr', 'míle', 'kilometr'],
    el: ['απόσταση', 'μήκος', 'ύψος', 'πλάτος', 'μέτρο', 'μίλι', 'χιλιόμετρο'],
    sl: ['razdalja', 'dolžina', 'višina', 'širina', 'meter', 'milja', 'kilometer']
  },
  speed: {
    en: ['speed', 'velocity', 'fast', 'kmh', 'mph', 'knot', 'mach'],
    de: ['geschwindigkeit', 'tempo', 'kmh', 'mph', 'knoten', 'mach'],
    fr: ['vitesse', 'vélocité', 'vite', 'kmh', 'mph', 'nœud', 'mach'],
    es: ['velocidad', 'rapidez', 'rápido', 'kmh', 'mph', 'nudo', 'mach'],
    it: ['velocità', 'rapidità', 'veloce', 'kmh', 'mph', 'nodo', 'mach'],
    pt: ['velocidade', 'rapidez', 'rápido', 'kmh', 'mph', 'nó', 'mach'],
    nl: ['snelheid', 'tempo', 'snel', 'kmh', 'mph', 'knoop', 'mach'],
    pl: ['prędkość', 'szybkość', 'szybki', 'kmh', 'mph', 'węzeł', 'mach'],
    lb: ['vitesse', 'kmh', 'mph'],
    sv: ['hastighet', 'snabb', 'kmh', 'mph', 'knop', 'mach'],
    da: ['hastighed', 'hurtig', 'kmh', 'mph', 'knob', 'mach'],
    bg: ['скорост', 'бързо', 'кмч', 'възел', 'мах'],
    hr: ['brzina', 'brzo', 'kmh', 'mph', 'čvor', 'mach'],
    cs: ['rychlost', 'rychle', 'kmh', 'mph', 'uzel', 'mach'],
    el: ['ταχύτητα', 'γρήγορα', 'kmh', 'mph', 'κόμβος', 'μαχ'],
    sl: ['hitrost', 'hitro', 'kmh', 'mph', 'vozel', 'mach']
  },
  weight: {
    en: ['weight', 'mass', 'heavy', 'kilogram', 'pound', 'ounce', 'gram', 'ton'],
    de: ['gewicht', 'masse', 'schwer', 'kilogramm', 'pfund', 'unze', 'gramm', 'tonne'],
    fr: ['poids', 'masse', 'lourd', 'kilogramme', 'livre', 'once', 'gramme', 'tonne'],
    es: ['peso', 'masa', 'pesado', 'kilogramo', 'libra', 'onza', 'gramo', 'tonelada'],
    it: ['peso', 'massa', 'pesante', 'chilogrammo', 'libbra', 'oncia', 'grammo', 'tonnellata'],
    pt: ['peso', 'massa', 'pesado', 'quilograma', 'libra', 'onça', 'grama', 'tonelada'],
    nl: ['gewicht', 'massa', 'zwaar', 'kilogram', 'pond', 'ons', 'gram', 'ton'],
    pl: ['waga', 'masa', 'ciężki', 'kilogram', 'funt', 'uncja', 'gram', 'tona'],
    lb: ['gewiicht', 'mass', 'schwéier', 'kilogramm', 'pfund'],
    sv: ['vikt', 'massa', 'tung', 'kilogram', 'pund', 'uns', 'gram', 'ton'],
    da: ['vægt', 'masse', 'tung', 'kilogram', 'pund', 'unse', 'gram', 'ton'],
    bg: ['тегло', 'маса', 'тежък', 'килограм', 'паунд', 'унция', 'грам', 'тон'],
    hr: ['težina', 'masa', 'teško', 'kilogram', 'funta', 'unca', 'gram', 'tona'],
    cs: ['hmotnost', 'váha', 'těžký', 'kilogram', 'libra', 'unce', 'gram', 'tuna'],
    el: ['βάρος', 'μάζα', 'βαρύς', 'κιλό', 'λίβρα', 'ουγγιά', 'γραμμάριο', 'τόνος'],
    sl: ['teža', 'masa', 'težko', 'kilogram', 'funt', 'unca', 'gram', 'tona']
  },
  volume: {
    en: ['volume', 'liter', 'litre', 'gallon', 'fluid'],
    de: ['volumen', 'liter', 'gallone'],
    fr: ['volume', 'litre', 'gallon'],
    es: ['volumen', 'litro', 'galón'],
    it: ['volume', 'litro', 'gallone'],
    pt: ['volume', 'litro', 'galão'],
    nl: ['volume', 'liter', 'gallon', 'kopje'],
    pl: ['objętość', 'litr', 'galon', 'kwarta', 'filiżanka'],
    lb: ['volumen', 'liter', 'gallone'],
    sv: ['volym', 'liter', 'gallon', 'vätska'],
    da: ['volumen', 'rumfang', 'liter', 'gallon', 'væske'],
    bg: ['обем', 'литър', 'галон', 'течност'],
    hr: ['volumen', 'obujam', 'litra', 'galon', 'tekućina'],
    cs: ['objem', 'litr', 'galon', 'tekutina'],
    el: ['όγκος', 'λίτρο', 'γαλόνι', 'υγρό'],
    sl: ['prostornina', 'liter', 'galona', 'tekočina']
  },
};

function matchesWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])` + escaped + `([^\\p{L}\\p{N}]|$)`, 'iu');
  return regex.test(text);
}

const ALL_ALIASES_ESCAPED = Object.keys(UNIT_ALIASES)
  .sort((a, b) => b.length - a.length)
  .map(alias => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

// Matches patterns like "1 mile", "-5kg", "10.5 fl oz" using Unicode boundaries
// This ensures "1 mile" matches, but part of a larger, unexpected block containing numbers won't silently fail.
const NUMBER_UNIT_REGEX = new RegExp(`(?:^|[^\\p{L}\\p{N}]|-)\\d+(?:[.,]\\d+)?\\s*(?:${ALL_ALIASES_ESCAPED})(?:[^\\p{L}\\p{N}]|$)`, 'iu');

export function isUnitConverterQuery(query: string): boolean {
  if (!query?.trim()) return false;

  // Matches perfect structural conversion (e.g., "5 miles to km")
  if (parseUnitConversionQuery(query)) return true;

  const q = query.trim().toLowerCase();

  // Matches if a number is directly next to a valid Unit Alias (e.g., "1 mile", "5kg")
  if (NUMBER_UNIT_REGEX.test(q)) return true;

  const matchedUnitIds = new Set<string>();
  for (const [alias, def] of Object.entries(UNIT_ALIASES)) {
    if (matchesWholeWord(q, alias)) {
      matchedUnitIds.add(def.unit); // Groups "mile" and "miles" as the same unit entity
    }
  }

  const matchedCategoryIds = new Set<string>();
  for (const [cat, langKws] of Object.entries(UNIT_CATEGORY_KEYWORDS)) {
    for (const kws of Object.values(langKws)) {
      for (const kw of kws) {
        if (matchesWholeWord(q, kw)) {
          matchedCategoryIds.add(cat);
        }
      }
    }
  }

  const totalDistinctTerms = matchedUnitIds.size + matchedCategoryIds.size;

  if (totalDistinctTerms >= 2) return true;

  const hasConvertVerb = EXPLICIT_CONVERT_VERBS.some(verb => matchesWholeWord(q, verb));
  if (hasConvertVerb && totalDistinctTerms >= 1) return true;

  return false;
}