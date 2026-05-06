const ALL_CURRENCIES = [
  'usd', 'eur', 'gbp', 'jpy', 'chf', 'cad', 'aud', 'nzd', 'hkd', 'sgd',
  'nok', 'sek', 'dkk', 'pln', 'czk', 'huf', 'ron', 'bgn', 'hrk',
  'rub', 'inr', 'brl', 'mxn', 'krw', 'zar', 'thb', 'idr', 'myr', 'php', 'vnd',
  'try', 'aed', 'sar', 'qar', 'ils', 'cop', 'clp', 'pen', 'ars', 'uah',
  'isk', 'mad', 'twd', 'pkr', 'ngn', 'kwd',
];

const ALL_CRYPTO = [
  'btc', 'eth', 'usdt', 'bnb', 'sol', 'ada', 'xrp', 'ltc', 'bch', 'dot',
  'link', 'matic', 'avax', 'shib', 'doge', 'luna', 'uni', 'atom', 'xlm',
  'vet', 'trx', 'etc', 'fil', 'theta', 'algo', 'near', 'ftm', 'sand',
  'mana', 'grt', 'egld', 'hbar', 'one', 'flow', 'xtz', 'icp', 'eos',
];

const ALL_ASSETS = [...ALL_CURRENCIES, ...ALL_CRYPTO];

const CURRENCY_ALIASES: Record<string, string> = {
  dollar: 'usd', dollars: 'usd', 'us dollar': 'usd', 'us dollars': 'usd',
  'american dollar': 'usd', 'american dollars': 'usd',
  euro: 'eur', euros: 'eur', 'eu euro': 'eur',
  pound: 'gbp', pounds: 'gbp', 'british pound': 'gbp', 'british pounds': 'gbp',
  sterling: 'gbp', 'pound sterling': 'gbp',
  yen: 'jpy', 'japanese yen': 'jpy',
  franc: 'chf', 'swiss franc': 'chf', 'swiss francs': 'chf',
  'canadian dollar': 'cad', 'canadian dollars': 'cad',
  'australian dollar': 'aud', 'australian dollars': 'aud', 'aussie dollar': 'aud',
  'new zealand dollar': 'nzd', 'nz dollar': 'nzd', 'kiwi dollar': 'nzd', 'kiwi': 'nzd',
  'hong kong dollar': 'hkd', 'hk dollar': 'hkd',
  'singapore dollar': 'sgd', 'sg dollar': 'sgd',
  'norwegian krone': 'nok', 'krone': 'nok', 'kroner': 'nok',
  'swedish krona': 'sek', 'swedish krone': 'sek', 'krona': 'sek',
  'danish krone': 'dkk',
  'polish zloty': 'pln', 'zloty': 'pln', 'zlotych': 'pln',
  'czech koruna': 'czk', 'koruna': 'czk',
  'hungarian forint': 'huf', 'forint': 'huf',
  'romanian leu': 'ron', 'leu': 'ron',
  'russian ruble': 'rub', 'ruble': 'rub', 'rouble': 'rub',
  'indian rupee': 'inr', 'rupee': 'inr', 'rupees': 'inr',
  'brazilian real': 'brl', 'real': 'brl', 'reais': 'brl',
  'mexican peso': 'mxn', 'peso': 'mxn', 'pesos': 'mxn',
  'south korean won': 'krw', 'won': 'krw', 'korean won': 'krw',
  'south african rand': 'zar', 'rand': 'zar',
  'thai baht': 'thb', 'baht': 'thb',
  'turkish lira': 'try', 'lira': 'try',
  'uae dirham': 'aed', 'dirham': 'aed', 'dirhams': 'aed',
  'saudi riyal': 'sar', 'riyal': 'sar', 'riyals': 'sar',
  'israeli shekel': 'ils', 'shekel': 'ils', 'shekels': 'ils',
  'chinese yuan': 'cny', 'yuan': 'cny', 'renminbi': 'cny', 'rmb': 'cny',
  bitcoin: 'btc', 'bitcoin cash': 'bch',
  ethereum: 'eth', ether: 'eth',
  ripple: 'xrp',
  litecoin: 'ltc',
  dogecoin: 'doge',
  solana: 'sol',
  cardano: 'ada',
  'binance coin': 'bnb', 'binance': 'bnb',
  tether: 'usdt',
  polkadot: 'dot',
  avalanche: 'avax',
  polygon: 'matic',
  'shiba inu': 'shib', 'shiba': 'shib',
  chainlink: 'link',
  uniswap: 'uni',
  cosmos: 'atom',
  stellar: 'xlm',
  tron: 'trx',
  'ethereum classic': 'etc',
  vechain: 'vet',
  filecoin: 'fil',
  algorand: 'algo',
  'near protocol': 'near',
  fantom: 'ftm',
  sandbox: 'sand',
  decentraland: 'mana',
  'the graph': 'grt',
  elrond: 'egld',
  hedera: 'hbar',
  harmony: 'one',
  tezos: 'xtz',
  'internet computer': 'icp',
  'eos': 'eos',
  'us$': 'usd', 'us $': 'usd',
  '€': 'eur',
  '£': 'gbp',
  '¥': 'jpy',
  '₿': 'btc',
  '₽': 'rub',
  '₹': 'inr',
  '₩': 'krw',
  '฿': 'thb',
  'kr': 'sek',
  'zł': 'pln',
  'kč': 'czk',
  'ft': 'huf',
  'r$': 'brl',
  'kr.': 'dkk',
  'cny': 'cny',
};

const LANG_ALIASES: Record<string, Record<string, string>> = {
  de: {
    'us-dollar': 'usd', 'us dollar': 'usd', 'dollar': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'pfund': 'gbp', 'britisches pfund': 'gbp', 'englisches pfund': 'gbp',
    'yen': 'jpy', 'japanischer yen': 'jpy',
    'franken': 'chf', 'schweizer franken': 'chf',
    'kanadischer dollar': 'cad',
    'australischer dollar': 'aud',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubel': 'rub', 'russischer rubel': 'rub',
    'indische rupie': 'inr', 'rupie': 'inr',
    'chinesischer yuan': 'cny', 'yuan': 'cny',
  },
  fr: {
    'dollar américain': 'usd', 'dollar': 'usd', 'dollars': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'livre sterling': 'gbp', 'livre': 'gbp',
    'yen japonais': 'jpy', 'yen': 'jpy',
    'franc suisse': 'chf',
    'dollar canadien': 'cad',
    'dollar australien': 'aud',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rouble': 'rub',
    'roupie': 'inr', 'roupie indienne': 'inr',
    'yuan chinois': 'cny', 'yuan': 'cny',
  },
  es: {
    'dólar': 'usd', 'dolar': 'usd', 'dólares': 'usd', 'dolares': 'usd',
    'dólar americano': 'usd', 'dólar estadounidense': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'libra esterlina': 'gbp', 'libra': 'gbp',
    'yen japonés': 'jpy', 'yen': 'jpy',
    'franco suizo': 'chf',
    'dólar canadiense': 'cad',
    'dólar australiano': 'aud',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rublo': 'rub', 'rublo ruso': 'rub',
    'rupia india': 'inr', 'rupia': 'inr',
    'yuan chino': 'cny', 'yuan': 'cny',
    'peso mexicano': 'mxn', 'peso': 'mxn',
  },
  it: {
    'dollaro': 'usd', 'dollaro americano': 'usd', 'dollari': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'sterlina': 'gbp', 'sterlina britannica': 'gbp',
    'yen giapponese': 'jpy', 'yen': 'jpy',
    'franco svizzero': 'chf',
    'dollaro canadese': 'cad',
    'dollaro australiano': 'aud',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rublo': 'rub',
    'rupia indiana': 'inr', 'rupia': 'inr',
    'yuan cinese': 'cny', 'yuan': 'cny',
  },
  pt: {
    'dólar': 'usd', 'dólar americano': 'usd', 'dólares': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'libra esterlina': 'gbp', 'libra': 'gbp',
    'iene japonês': 'jpy', 'iene': 'jpy',
    'franco suíço': 'chf',
    'dólar canadense': 'cad',
    'dólar australiano': 'aud',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rublo': 'rub',
    'rupia indiana': 'inr', 'rupia': 'inr',
    'yuan chinês': 'cny', 'yuan': 'cny',
    'real brasileiro': 'brl', 'real': 'brl',
  },
  nl: {
    'dollar': 'usd', 'Amerikaanse dollar': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'pond sterling': 'gbp', 'pond': 'gbp',
    'yen': 'jpy', 'Japanse yen': 'jpy',
    'Zwitserse frank': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
  },
  pl: {
    'dolar': 'usd', 'dolar amerykański': 'usd', 'dolary': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'funt': 'gbp', 'funt brytyjski': 'gbp',
    'jen': 'jpy', 'jen japoński': 'jpy',
    'frank szwajcarski': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubel': 'rub',
    'rupia': 'inr',
    'juan': 'cny',
  },
  sv: {
    'dollar': 'usd', 'amerikansk dollar': 'usd',
    'euro': 'eur',
    'pund': 'gbp', 'brittiskt pund': 'gbp',
    'yen': 'jpy',
    'franc': 'chf', 'schweizerfranc': 'chf',
    'krona': 'sek', 'svensk krona': 'sek',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubel': 'rub', 'rupie': 'inr', 'yuan': 'cny',
  },
  da: {
    'dollar': 'usd', 'amerikansk dollar': 'usd',
    'euro': 'eur',
    'pund': 'gbp', 'britisk pund': 'gbp',
    'yen': 'jpy',
    'franc': 'chf',
    'krone': 'dkk', 'dansk krone': 'dkk',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubel': 'rub', 'rupi': 'inr', 'yuan': 'cny',
  },
  bg: {
    'долар': 'usd', 'долари': 'usd',
    'евро': 'eur',
    'паунд': 'gbp', 'британски паунд': 'gbp',
    'йена': 'jpy', 'франк': 'chf',
    'биткойн': 'btc', 'етериум': 'eth',
    'рубла': 'rub', 'рубли': 'rub',
    'рупия': 'inr', 'юан': 'cny',
  },
  hr: {
    'dolar': 'usd', 'američki dolar': 'usd',
    'euro': 'eur', 'eura': 'eur',
    'funta': 'gbp', 'britanska funta': 'gbp',
    'jen': 'jpy', 'franak': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubalj': 'rub', 'rupija': 'inr', 'juan': 'cny',
  },
  cs: {
    'dolar': 'usd', 'americký dolar': 'usd',
    'euro': 'eur',
    'libra': 'gbp', 'britská libra': 'gbp',
    'jen': 'jpy', 'frank': 'chf', 'švýcarský frank': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubl': 'rub', 'rupie': 'inr', 'jüan': 'cny',
  },
  el: {
    'δολάριο': 'usd', 'δολάρια': 'usd',
    'ευρώ': 'eur',
    'λίρα': 'gbp', 'αγγλική λίρα': 'gbp',
    'γιεν': 'jpy', 'φράγκο': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'ρούβλι': 'rub', 'ρουπία': 'inr', 'γιουάν': 'cny',
  },
  sl: {
    'dolar': 'usd', 'ameriški dolar': 'usd',
    'evro': 'eur',
    'funt': 'gbp', 'britanski funt': 'gbp',
    'jen': 'jpy', 'frank': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
    'rubelj': 'rub', 'rupija': 'inr', 'juan': 'cny',
  },
  lb: {
    'dollar': 'usd', 'us-dollar': 'usd',
    'euro': 'eur', 'euros': 'eur',
    'pfund': 'gbp', 'britescht pfund': 'gbp',
    'yen': 'jpy',
    'franken': 'chf', 'schwäizer franken': 'chf',
    'bitcoin': 'btc', 'ethereum': 'eth',
  },
};

const PREP_PATTERN_STR = `to|in|into|en|nach|zu|à|pour|a|em|till|til|към|в|naar|w|do|na|per|i|auf|gegen|for|vers|sur|de|von|aus|u|se|v`;

const CONVERTER_KEYWORDS: Record<string, string[]> = {
  en: ['convert', 'converter', 'exchange', 'rate', 'exchange rate', 'how much', 'how many', 'worth', 'value'],
  de: ['umrechnen', 'umrechner', 'wechselkurs', 'kurs', 'konvertieren', 'tauschen', 'wie viel', 'wieviel'],
  fr: ['convertir', 'convertisseur', 'taux de change', 'change', 'combien', 'valeur'],
  es: ['convertir', 'conversor', 'cambio', 'tipo de cambio', 'cuánto', 'cuanto', 'valor'],
  it: ['convertire', 'convertitore', 'tasso di cambio', 'cambio', 'quanto', 'valore'],
  pt: ['converter', 'conversor', 'taxa de câmbio', 'câmbio', 'quanto', 'valor'],
  nl: ['omrekenen', 'wisselkoers', 'omrekening', 'hoeveel', 'waarde'],
  pl: ['przelicz', 'przelicznik', 'kurs wymiany', 'wymiana', 'ile', 'ile warte'],
  sv: ['konvertera', 'omvandla', 'växelkurs', 'omvandlare', 'hur mycket', 'värde'],
  da: ['konverter', 'omregn', 'vekselkurs', 'hvor meget', 'værdi'],
  bg: ['конвертиране', 'конвертор', 'валута', 'курс', 'колко', 'стойност'],
  hr: ['pretvori', 'pretvarač', 'tečaj', 'koliko', 'vrijednost'],
  cs: ['převést', 'převodník', 'kurz', 'kolik', 'hodnota'],
  el: ['μετατροπή', 'μετατροπέας', 'ισοτιμία', 'πόσο', 'αξία'],
  sl: ['pretvori', 'pretvornik', 'tečaj', 'koliko', 'vrednost'],
  lb: ['ëmrechnen', 'kurs', 'konvertéieren'],
};

export interface ParsedCurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number | null;
  pairTicker: string;
  pairTickerAlt: string | null;
}

function buildAllAliasMap(): Record<string, string> {
  const map: Record<string, string> = { ...CURRENCY_ALIASES };
  for (const langMap of Object.values(LANG_ALIASES)) {
    for (const [alias, code] of Object.entries(langMap)) {
      map[alias.toLowerCase()] = code;
    }
  }
  return map;
}

const FULL_ALIAS_MAP = buildAllAliasMap();

function normalizeCurrencyName(name: string): string | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  if (FULL_ALIAS_MAP[lower]) return FULL_ALIAS_MAP[lower];
  if (ALL_ASSETS.includes(lower)) return lower;
  if (lower === 'cny') return 'cny';
  return null;
}

function buildPairTicker(from: string, to: string): { pairTicker: string; pairTickerAlt: string | null } {
  const isCryptoFrom = ALL_CRYPTO.includes(from.toLowerCase());
  const isCryptoTo = ALL_CRYPTO.includes(to.toLowerCase());
  if (isCryptoFrom && isCryptoTo) {
    return { pairTicker: `${from.toUpperCase()}${to.toUpperCase()}-FX`, pairTickerAlt: `${to.toUpperCase()}${from.toUpperCase()}-FX` };
  }
  if (isCryptoFrom) {
    return { pairTicker: `${from.toUpperCase()}${to.toUpperCase()}-FX`, pairTickerAlt: from.toUpperCase() };
  }
  if (isCryptoTo) {
    return { pairTicker: `${to.toUpperCase()}${from.toUpperCase()}-FX`, pairTickerAlt: to.toUpperCase() };
  }
  return {
    pairTicker: `${from.toUpperCase()}${to.toUpperCase()}-FX`,
    pairTickerAlt: `${to.toUpperCase()}${from.toUpperCase()}-FX`,
  };
}

const AMOUNT_RE = /(\d+(?:[.,]\d+)?(?:\s*[kKmMbB])?)/;

function parseAmountStr(raw: string): number {
  const clean = raw.replace(/\s/g, '').replace(',', '.');
  const m = clean.match(/^(\d+(?:\.\d+)?)([kKmMbB]?)$/);
  if (!m) return parseFloat(clean) || 0;
  const base = parseFloat(m[1]);
  const suffix = m[2].toLowerCase();
  if (suffix === 'k') return base * 1000;
  if (suffix === 'm') return base * 1_000_000;
  if (suffix === 'b') return base * 1_000_000_000;
  return base;
}

function buildAssetPattern(): string {
  const sortedAliases = Object.keys(FULL_ALIAS_MAP)
    .filter(a => a.length > 1)
    .sort((a, b) => b.length - a.length);
  const allPatterns = [...sortedAliases, ...ALL_ASSETS]
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return `(${[...new Set(allPatterns)].join('|')})`;
}

const ASSET_PATTERN = buildAssetPattern();

function tryParseConversion(q: string): ParsedCurrencyConversion | null {
  const clean = q.trim().toLowerCase();

  const patterns = [
    new RegExp(`^(?:convert(?:ir|ire|eren|ieren|er|eer|re)?\\s+)?${AMOUNT_RE.source}\\s*${ASSET_PATTERN}\\s+(?:${PREP_PATTERN_STR})\\s*(?:(?:${ASSET_PATTERN}\\s+)?)?${ASSET_PATTERN}$`, 'i'),
    new RegExp(`^(?:convert(?:ir|ire|eren|ieren|er|eer|re)?\\s+)?${ASSET_PATTERN}\\s+(?:${PREP_PATTERN_STR})\\s*(?:(?:${ASSET_PATTERN}\\s+)?)?${ASSET_PATTERN}$`, 'i'),
    new RegExp(`^(?:how\\s+(?:much|many)\\s+(?:is|are)?\\s*)?${AMOUNT_RE.source}\\s*${ASSET_PATTERN}\\s+(?:${PREP_PATTERN_STR})\\s*${ASSET_PATTERN}$`, 'i'),
    new RegExp(`^${AMOUNT_RE.source}\\s*${ASSET_PATTERN}\\s*=\\s*\\??\\s*${ASSET_PATTERN}$`, 'i'),
    new RegExp(`^${ASSET_PATTERN}\\s*\\/\\s*${ASSET_PATTERN}$`, 'i'),
    new RegExp(`^${AMOUNT_RE.source}\\s*${ASSET_PATTERN}\\s+${ASSET_PATTERN}$`, 'i'),
  ];

  for (const pattern of patterns) {
    const m = clean.match(pattern);
    if (!m) continue;

    let amount: number | null = null;
    let from: string | null = null;
    let to: string | null = null;

    const groups = m.slice(1).filter(g => g !== undefined);

    if (pattern.source.startsWith('^(?:convert')) {
      if (pattern.source.includes(AMOUNT_RE.source.replace('(', '(?:'))) {
        const amtIdx = groups.findIndex(g => /^\d/.test(g));
        if (amtIdx >= 0) {
          amount = parseAmountStr(groups[amtIdx]);
          const rest = groups.slice(amtIdx + 1).filter(g => g && !/^\d/.test(g) && g.length > 1);
          from = normalizeCurrencyName(rest[0] || '');
          to = normalizeCurrencyName(rest[rest.length - 1] || '');
        } else {
          const assetGroups = groups.filter(g => g && !/^\d/.test(g) && g.length > 1);
          from = normalizeCurrencyName(assetGroups[0] || '');
          to = normalizeCurrencyName(assetGroups[assetGroups.length - 1] || '');
        }
      }
    }

    if (!from || !to) {
      const nonNumGroups = groups.filter(g => g && !/^\d/.test(g) && g.length > 1);
      const numGroups = groups.filter(g => g && /^\d/.test(g));
      if (numGroups.length > 0 && amount === null) {
        amount = parseAmountStr(numGroups[0]);
      }
      if (nonNumGroups.length >= 2) {
        from = normalizeCurrencyName(nonNumGroups[0]);
        to = normalizeCurrencyName(nonNumGroups[nonNumGroups.length - 1]);
      }
    }

    if (from && to && from !== to) {
      const { pairTicker, pairTickerAlt } = buildPairTicker(from, to);
      return { fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase(), amount: amount || null, pairTicker, pairTickerAlt };
    }
  }

  return null;
}

function tryParseNatural(q: string): ParsedCurrencyConversion | null {
  const clean = q.trim().toLowerCase();

  const convKeywords = [
    'convert', 'convertir', 'convertire', 'konvertieren', 'umrechnen', 'konvertera', 'omvandla',
    'omrekenen', 'przelicz', 'converter', 'konverter', 'convierta', 'convertisseur', 'pretvori',
    'převést', 'μετατροπή', 'конвертиране', 'konvertéieren',
  ];

  const prepKeywords = PREP_PATTERN_STR.split('|');

  let workStr = clean;
  for (const kw of convKeywords) {
    const re = new RegExp(`^${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
    workStr = workStr.replace(re, '');
    if (workStr !== clean) break;
  }

  for (const prep of prepKeywords) {
    const re = new RegExp(`\\s+${prep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
    const parts = workStr.split(re);
    if (parts.length >= 2) {
      const leftPart = parts[0].trim();
      const rightPart = parts[parts.length - 1].trim();

      const amtFromMatch = leftPart.match(/^(\d+(?:[.,]\d+)?(?:\s*[kKmMbB])?)\s+(.+)$/);
      const amtToMatch = rightPart.match(/^(.+?)\s+(\d+(?:[.,]\d+)?(?:\s*[kKmMbB])?)$/);

      let amount: number | null = null;
      let fromStr = leftPart;
      let toStr = rightPart;

      if (amtFromMatch) {
        amount = parseAmountStr(amtFromMatch[1]);
        fromStr = amtFromMatch[2];
      }
      if (amtToMatch) {
        toStr = amtToMatch[1];
      }

      const from = normalizeCurrencyName(fromStr);
      const to = normalizeCurrencyName(toStr);

      if (from && to && from !== to) {
        const { pairTicker, pairTickerAlt } = buildPairTicker(from, to);
        return { fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase(), amount, pairTicker, pairTickerAlt };
      }
    }
  }

  return null;
}

function tryParsePairTicker(q: string): ParsedCurrencyConversion | null {
  const clean = q.trim().toUpperCase();

  const fxMatch = clean.match(/^([A-Z]{3,6})([A-Z]{3})(?:-FX)?$/);
  if (fxMatch) {
    const from = normalizeCurrencyName(fxMatch[1].toLowerCase()) || fxMatch[1].toLowerCase();
    const to = normalizeCurrencyName(fxMatch[2].toLowerCase()) || fxMatch[2].toLowerCase();
    const fromKnown = ALL_ASSETS.includes(from.toLowerCase()) || ALL_ASSETS.includes(fxMatch[1].toLowerCase());
    const toKnown = ALL_ASSETS.includes(to.toLowerCase()) || ALL_ASSETS.includes(fxMatch[2].toLowerCase());
    if (fromKnown && toKnown && from !== to) {
      const fromUp = (normalizeCurrencyName(fxMatch[1].toLowerCase()) || fxMatch[1]).toUpperCase();
      const toUp = (normalizeCurrencyName(fxMatch[2].toLowerCase()) || fxMatch[2]).toUpperCase();
      const { pairTicker, pairTickerAlt } = buildPairTicker(fromUp, toUp);
      return { fromCurrency: fromUp, toCurrency: toUp, amount: null, pairTicker, pairTickerAlt };
    }
  }

  const singleMatch = clean.match(/^([A-Z]{3,6})$/);
  if (singleMatch) {
    const code = singleMatch[1].toLowerCase();
    if (ALL_ASSETS.includes(code)) {
      const upper = code.toUpperCase();
      const isCrypto = ALL_CRYPTO.includes(code);
      const counterpart = isCrypto ? 'USD' : 'USD';
      const { pairTicker, pairTickerAlt } = buildPairTicker(upper, counterpart);
      return { fromCurrency: upper, toCurrency: counterpart, amount: null, pairTicker, pairTickerAlt };
    }
  }

  return null;
}

export function parseCurrencyConversionQuery(query: string): ParsedCurrencyConversion | null {
  if (!query || !query.trim()) return null;

  const result = tryParseConversion(query) || tryParseNatural(query);
  if (result) return result;

  const q = query.trim().toLowerCase();

  const re = new RegExp(
    `^(\\d+(?:[.,]\\d+)?)\\s*(${ALL_ASSETS.join('|')})\\s+(?:${PREP_PATTERN_STR})\\s+(${ALL_ASSETS.join('|')})$`,
    'i'
  );
  const m = q.match(re);
  if (m) {
    const amount = parseFloat(m[1].replace(',', '.'));
    const from = normalizeCurrencyName(m[2]);
    const to = normalizeCurrencyName(m[m.length - 1]);
    if (from && to && from !== to) {
      const { pairTicker, pairTickerAlt } = buildPairTicker(from, to);
      return { fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase(), amount, pairTicker, pairTickerAlt };
    }
  }

  const reNoAmount = new RegExp(
    `^(${ALL_ASSETS.join('|')})\\s+(?:${PREP_PATTERN_STR})\\s+(${ALL_ASSETS.join('|')})$`,
    'i'
  );
  const m2 = q.match(reNoAmount);
  if (m2) {
    const from = normalizeCurrencyName(m2[1]);
    const to = normalizeCurrencyName(m2[m2.length - 1]);
    if (from && to && from !== to) {
      const { pairTicker, pairTickerAlt } = buildPairTicker(from, to);
      return { fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase(), amount: null, pairTicker, pairTickerAlt };
    }
  }

  return null;
}

export function parseCurrencyPairQuery(query: string): ParsedCurrencyConversion | null {
  return tryParsePairTicker(query);
}

function matchesWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])` + escaped + `([^\\p{L}\\p{N}]|$)`, 'iu');
  return regex.test(text);
}

export function isCurrencyConverterQuery(query: string, financialCategory?: string | null, assetType?: string): boolean {
  if (assetType === 'stock') return false;
  if (assetType === 'currency' || assetType === 'crypto') return true;
  if (financialCategory === 'Finance' && assetType !== 'stock') return true;

  const q = query.trim().toLowerCase();
  if (!q) return false;

  if (parseCurrencyConversionQuery(q)) return true;

  //e.g., "EURUSD", "BTC-FX"
  if (parseCurrencyPairQuery(q)) return true;

  let hasKeyword = false;
  for (const keywords of Object.values(CONVERTER_KEYWORDS)) {
    for (const kw of keywords) {
      if (matchesWholeWord(q, kw)) {
        hasKeyword = true;
        break;
      }
    }
    if (hasKeyword) break;
  }

  if (hasKeyword) {
    const allAssetKeys = [...ALL_ASSETS, ...Object.keys(FULL_ALIAS_MAP)]
      .sort((a, b) => b.length - a.length)
      .map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
    const assetPattern = allAssetKeys.join('|');
    const assetRegex = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${assetPattern})(?:[^\\p{L}\\p{N}]|$)`, 'iu');
    
    if (assetRegex.test(q)) {
      const isAmbiguousWeightOrWord = /(?:^|[^\\p{L}\\p{N}])(pound|pounds|real)(?:[^\\p{L}\\p{N}]|$)/iu.test(q);
      
      const financeVerbsStr = ['convert', 'converter', 'convertir', 'exchange', 'rate', 'cambio', 'kurs', 
                               'przelicz', 'konvertera', 'omvandla', 'omregn', 'конвертиране', 'pretvori', 
                               'převést', 'μετατροπή'].join('|');
      const hasStrongFinanceVerb = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${financeVerbsStr})(?:[^\\p{L}\\p{N}]|$)`, 'iu').test(q);
      
      if (isAmbiguousWeightOrWord && !hasStrongFinanceVerb) {
        return false;
      }

      return true;
    }
  }

  return false;
}

export function inferCrossPairs(knownPairs: string[]): string[] {
  const pairs: Array<{ from: string; to: string }> = [];
  for (const p of knownPairs) {
    const m = p.match(/^([A-Z]{3,6})([A-Z]{3})-FX$/i);
    if (m) pairs.push({ from: m[1].toUpperCase(), to: m[2].toUpperCase() });
  }

  const inferred = new Set<string>();
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const a = pairs[i];
      const b = pairs[j];
      if (a.from === b.from) {
        inferred.add(`${a.to}${b.to}-FX`);
        inferred.add(`${b.to}${a.to}-FX`);
      }
      if (a.to === b.to) {
        inferred.add(`${a.from}${b.from}-FX`);
        inferred.add(`${b.from}${a.from}-FX`);
      }
      if (a.from === b.to) {
        inferred.add(`${a.to}${b.from}-FX`);
        inferred.add(`${b.from}${a.to}-FX`);
      }
      if (a.to === b.from) {
        inferred.add(`${a.from}${b.to}-FX`);
        inferred.add(`${b.to}${a.from}-FX`);
      }
    }
  }

  return Array.from(inferred).filter(p => !knownPairs.includes(p));
}