export interface QuickSearchBang {
  bang: string;
  name: string;
  favicon: string;
  category: string;
  buildUrl: (query: string, lang: string) => string;
}

const enc = encodeURIComponent;

export const QUICK_SEARCH_BANGS: QuickSearchBang[] = [
  // Wikipedia
  { bang: '!w',       name: 'Wikipedia',              favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q, l) => `https://${l}.wikipedia.org/w/index.php?title=Special:Search&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wen',     name: 'Wikipedia (English)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://en.wikipedia.org/w/index.php?title=Special:Search&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wde',     name: 'Wikipedia (Deutsch)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://de.wikipedia.org/w/index.php?title=Spezial:Suche&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wfr',     name: 'Wikipedia (Français)',    favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://fr.wikipedia.org/w/index.php?title=Sp%C3%A9cial:Recherche&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wes',     name: 'Wikipedia (Español)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://es.wikipedia.org/w/index.php?title=Especial:Buscar&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wit',     name: 'Wikipedia (Italiano)',    favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://it.wikipedia.org/w/index.php?title=Speciale:Ricerca&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wnl',     name: 'Wikipedia (Nederlands)',  favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://nl.wikipedia.org/w/index.php?title=Speciaal:Zoeken&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wpl',     name: 'Wikipedia (Polski)',      favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://pl.wikipedia.org/w/index.php?title=Specjalna:Szukaj&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wpt',     name: 'Wikipedia (Português)',   favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://pt.wikipedia.org/w/index.php?title=Especial:Pesquisar&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wsv',     name: 'Wikipedia (Svenska)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://sv.wikipedia.org/w/index.php?title=Special:S%C3%B6k&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wda',     name: 'Wikipedia (Dansk)',       favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://da.wikipedia.org/w/index.php?title=Special:S%C3%B8gning&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wru',     name: 'Wikipedia (Русский)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://ru.wikipedia.org/w/index.php?title=Special:Search&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!whi',     name: 'Wikipedia (हिन्दी)',      favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://hi.wikipedia.org/w/index.php?title=Special:Search&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wcs',     name: 'Wikipedia (Čeština)',     favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://cs.wikipedia.org/w/index.php?title=Speci%C3%A1ln%C3%AD:Hledat&go=Go&search=${enc(q)}&ns0=1` },
  { bang: '!wel',     name: 'Wikipedia (Ελληνικά)',    favicon: 'wikipedia.org',             category: 'Encyclopedia', buildUrl: (q) => `https://el.wikipedia.org/w/index.php?title=Special:Search&go=Go&search=${enc(q)}&ns0=1` },

  // Shopping
  { bang: '!a',       name: 'Amazon',                  favicon: 'amazon.com',                category: 'Shopping', buildUrl: (q, l) => { const d: Record<string,string> = { de:'amazon.de', fr:'amazon.fr', it:'amazon.it', es:'amazon.es', nl:'amazon.nl', pl:'amazon.pl', pt:'amazon.com.br', sv:'amazon.se', da:'amazon.de', en:'amazon.com', hi:'amazon.in' }; return `https://www.${d[l] || 'amazon.com'}/s?k=${enc(q)}`; } },
  { bang: '!ade',     name: 'Amazon.de',               favicon: 'amazon.de',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.de/s?k=${enc(q)}` },
  { bang: '!afr',     name: 'Amazon.fr',               favicon: 'amazon.fr',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.fr/s?k=${enc(q)}` },
  { bang: '!auk',     name: 'Amazon UK',               favicon: 'amazon.co.uk',              category: 'Shopping', buildUrl: (q) => `https://www.amazon.co.uk/s?k=${enc(q)}` },
  { bang: '!ait',     name: 'Amazon.it',               favicon: 'amazon.it',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.it/s?k=${enc(q)}` },
  { bang: '!aes',     name: 'Amazon.es',               favicon: 'amazon.es',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.es/s?k=${enc(q)}` },
  { bang: '!ain',     name: 'Amazon India',            favicon: 'amazon.in',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.in/s?k=${enc(q)}` },
  { bang: '!aca',     name: 'Amazon Canada',           favicon: 'amazon.ca',                 category: 'Shopping', buildUrl: (q) => `https://www.amazon.ca/s?k=${enc(q)}` },
  { bang: '!aau',     name: 'Amazon Australia',        favicon: 'amazon.com.au',             category: 'Shopping', buildUrl: (q) => `https://www.amazon.com.au/s?k=${enc(q)}` },
  { bang: '!e',       name: 'eBay',                    favicon: 'ebay.com',                  category: 'Shopping', buildUrl: (q, l) => { const d: Record<string,string> = { de:'ebay.de', fr:'ebay.fr', it:'ebay.it', es:'ebay.es', nl:'ebay.nl', pl:'ebay.pl', en:'ebay.com' }; return `https://www.${d[l] || 'ebay.com'}/sch/i.html?_nkw=${enc(q)}`; } },
  { bang: '!ede',     name: 'eBay Deutschland',        favicon: 'ebay.de',                   category: 'Shopping', buildUrl: (q) => `https://www.ebay.de/sch/i.html?_nkw=${enc(q)}` },
  { bang: '!euk',     name: 'eBay UK',                 favicon: 'ebay.co.uk',                category: 'Shopping', buildUrl: (q) => `https://www.ebay.co.uk/sch/i.html?_nkw=${enc(q)}` },
  { bang: '!efr',     name: 'eBay France',             favicon: 'ebay.fr',                   category: 'Shopping', buildUrl: (q) => `https://www.ebay.fr/sch/i.html?_nkw=${enc(q)}` },
  { bang: '!ali',     name: 'AliExpress',              favicon: 'aliexpress.com',            category: 'Shopping', buildUrl: (q) => `https://www.aliexpress.com/wholesale?SearchText=${enc(q)}` },
  { bang: '!etsy',    name: 'Etsy',                    favicon: 'etsy.com',                  category: 'Shopping', buildUrl: (q) => `https://www.etsy.com/search?q=${enc(q)}` },
  { bang: '!alg',     name: 'Allegro',                 favicon: 'allegro.pl',                category: 'Shopping', buildUrl: (q) => `https://allegro.pl/listing?string=${enc(q)}` },
  { bang: '!zalando', name: 'Zalando',                 favicon: 'zalando.de',                category: 'Shopping', buildUrl: (q, l) => { const d: Record<string,string> = { de:'zalando.de', fr:'zalando.fr', it:'zalando.it', es:'zalando.es', nl:'zalando.nl', pl:'zalando.pl', sv:'zalando.se', da:'zalando.dk', en:'zalando.co.uk' }; return `https://www.${d[l] || 'zalando.de'}/catalog/?q=${enc(q)}`; } },
  { bang: '!mz',      name: 'mydealz',                 favicon: 'mydealz.de',                category: 'Shopping', buildUrl: (q) => `https://www.mydealz.de/search?q=${enc(q)}` },
  { bang: '!id',      name: 'idealo',                  favicon: 'idealo.de',                 category: 'Shopping', buildUrl: (q, l) => { const d: Record<string,string> = { de:'idealo.de', fr:'idealo.fr', it:'idealo.it', es:'idealo.es', nl:'idealo.nl', pt:'idealo.pt', en:'idealo.co.uk' }; return `https://www.${d[l] || 'idealo.de'}/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}`; } },
  { bang: '!idde',    name: 'idealo.de',               favicon: 'idealo.de',                 category: 'Shopping', buildUrl: (q) => `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!iduk',    name: 'idealo.co.uk',              favicon: 'idealo.co.uk',                 category: 'Shopping', buildUrl: (q) => `https://www.idealo.co.uk/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!ides',    name: 'idealo.es',                 favicon: 'idealo.es',                    category: 'Shopping', buildUrl: (q) => `https://www.idealo.es/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!idit',    name: 'idealo.it',                 favicon: 'idealo.it',                    category: 'Shopping', buildUrl: (q) => `https://www.idealo.it/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!idfr',    name: 'idealo.fr',                 favicon: 'idealo.fr',                    category: 'Shopping', buildUrl: (q) => `https://www.idealo.fr/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!idat',    name: 'idealo.at',                 favicon: 'idealo.at',                    category: 'Shopping', buildUrl: (q) => `https://www.idealo.at/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}` },
  { bang: '!check24', name: 'Check24',                 favicon: 'check24.de',                category: 'Shopping', buildUrl: (q) => `https://www.check24.de/produkte/?q=${enc(q)}` },

  // Social
  { bang: '!r',       name: 'Reddit',                  favicon: 'reddit.com',                category: 'Social', buildUrl: (q) => `https://www.reddit.com/search?q=${enc(q)}` },
  { bang: '!rsub',    name: 'Reddit Subreddit',         favicon: 'reddit.com',                category: 'Social', buildUrl: (q) => `https://www.reddit.com/r/${enc(q)}` },
  { bang: '!x',       name: 'X (Twitter)',             favicon: 'x.com',                     category: 'Social', buildUrl: (q) => `https://x.com/search?q=${enc(q)}` },
  { bang: '!tw',      name: 'X (Twitter)',             favicon: 'x.com',                     category: 'Social', buildUrl: (q) => `https://x.com/search?q=${enc(q)}` },
  { bang: '!li',      name: 'LinkedIn',                favicon: 'linkedin.com',              category: 'Social', buildUrl: (q) => `https://www.linkedin.com/search/results/all/?keywords=${enc(q)}` },
  { bang: '!fb',      name: 'Facebook',                favicon: 'facebook.com',              category: 'Social', buildUrl: (q) => `https://www.facebook.com/search/top?q=${enc(q)}` },
  { bang: '!inst',    name: 'Instagram',               favicon: 'instagram.com',             category: 'Social', buildUrl: (q) => `https://www.instagram.com/explore/tags/${enc(q)}/` },
  { bang: '!tiktok',  name: 'TikTok',                  favicon: 'tiktok.com',                category: 'Social', buildUrl: (q) => `https://www.tiktok.com/search?q=${enc(q)}` },
  { bang: '!p',       name: 'Pinterest',               favicon: 'pinterest.com',             category: 'Social', buildUrl: (q) => `https://www.pinterest.com/search/pins/?q=${enc(q)}` },

  // Video & Music
  { bang: '!y',       name: 'YouTube',                 favicon: 'youtube.com',               category: 'Video & Music', buildUrl: (q) => `https://www.youtube.com/results?search_query=${enc(q)}` },
  { bang: '!yt',      name: 'YouTube',                 favicon: 'youtube.com',               category: 'Video & Music', buildUrl: (q) => `https://www.youtube.com/results?search_query=${enc(q)}` },
  { bang: '!sp',      name: 'Spotify',                 favicon: 'spotify.com',               category: 'Video & Music', buildUrl: (q) => `https://open.spotify.com/search/${enc(q)}` },
  { bang: '!sc',      name: 'SoundCloud',              favicon: 'soundcloud.com',            category: 'Video & Music', buildUrl: (q) => `https://soundcloud.com/search?q=${enc(q)}` },
  { bang: '!nf',      name: 'Netflix',                 favicon: 'netflix.com',               category: 'Video & Music', buildUrl: (q) => `https://www.netflix.com/search?q=${enc(q)}` },
  { bang: '!ste',     name: 'Steam',                   favicon: 'store.steampowered.com',    category: 'Video & Music', buildUrl: (q) => `https://store.steampowered.com/search/?term=${enc(q)}` },
  { bang: '!imdb',    name: 'IMDB',                    favicon: 'imdb.com',                  category: 'Video & Music', buildUrl: (q) => `https://www.imdb.com/find?q=${enc(q)}` },

  // Search Engines
  { bang: '!g',       name: 'Google',                  favicon: 'google.com',                 category: 'Search', buildUrl: (q) => `https://www.google.com/search?q=${enc(q)}` },
  { bang: '!gi',      name: 'Google Images',           favicon: 'google.com',                 category: 'Search', buildUrl: (q) => `https://www.google.com/search?q=${enc(q)}&tbm=isch` },
  { bang: '!b',       name: 'Bing',                    favicon: 'bing.com',                   category: 'Search', buildUrl: (q) => `https://www.bing.com/search?q=${enc(q)}` },
  { bang: '!bi',      name: 'Bing Images',             favicon: 'bing.com',                   category: 'Search', buildUrl: (q) => `https://www.bing.com/images/search?q=${enc(q)}` },
  { bang: '!ddg',     name: 'DuckDuckGo',              favicon: 'duckduckgo.com',             category: 'Search', buildUrl: (q) => `https://duckduckgo.com/?q=${enc(q)}` },
  { bang: '!ddgi',    name: 'DuckDuckGo Images',       favicon: 'duckduckgo.com',             category: 'Search', buildUrl: (q) => `https://duckduckgo.com/?q=${enc(q)}&iax=images&ia=images` },
  { bang: '!brave',   name: 'Brave Search',            favicon: 'search.brave.com',           category: 'Search', buildUrl: (q) => `https://search.brave.com/search?q=${enc(q)}` },
  { bang: '!bravei',  name: 'Brave Images',            favicon: 'search.brave.com',           category: 'Search', buildUrl: (q) => `https://search.brave.com/images?q=${enc(q)}` },
  { bang: '!s',       name: 'Startpage',               favicon: 'startpage.com',              category: 'Search', buildUrl: (q) => `https://www.startpage.com/search?q=${enc(q)}` },
  { bang: '!si',      name: 'Startpage Images',        favicon: 'startpage.com',              category: 'Search', buildUrl: (q) => `https://www.startpage.com/search?q=${enc(q)}&cat=images` },
  { bang: '!qw',      name: 'Qwant',                   favicon: 'qwant.com',                  category: 'Search', buildUrl: (q) => `https://www.qwant.com/?q=${enc(q)}` },
  { bang: '!qwi',     name: 'Qwant Images',            favicon: 'qwant.com',                  category: 'Search', buildUrl: (q) => `https://www.qwant.com/?q=${enc(q)}&t=images` },
  { bang: '!eco',     name: 'Ecosia',                  favicon: 'ecosia.org',                 category: 'Search', buildUrl: (q) => `https://www.ecosia.org/search?q=${enc(q)}` },

  // Developer & Tech
  { bang: '!gh',      name: 'GitHub',                  favicon: 'github.com',                category: 'Developer', buildUrl: (q) => `https://github.com/search?q=${enc(q)}` },
  { bang: '!ghr',     name: 'GitHub Repos',            favicon: 'github.com',                category: 'Developer', buildUrl: (q) => `https://github.com/search?q=${enc(q)}&type=repositories` },
  { bang: '!ghc',     name: 'GitHub Code',             favicon: 'github.com',                category: 'Developer', buildUrl: (q) => `https://github.com/search?q=${enc(q)}&type=code` },
  { bang: '!so',      name: 'Stack Overflow',          favicon: 'stackoverflow.com',         category: 'Developer', buildUrl: (q) => `https://stackoverflow.com/search?q=${enc(q)}` },
  { bang: '!mdn',     name: 'MDN Web Docs',            favicon: 'developer.mozilla.org',     category: 'Developer', buildUrl: (q) => `https://developer.mozilla.org/en-US/search?q=${enc(q)}` },
  { bang: '!npm',     name: 'npm',                     favicon: 'npmjs.com',                 category: 'Developer', buildUrl: (q) => `https://www.npmjs.com/search?q=${enc(q)}` },
  { bang: '!pypi',    name: 'PyPI',                    favicon: 'pypi.org',                  category: 'Developer', buildUrl: (q) => `https://pypi.org/search/?q=${enc(q)}` },
  { bang: '!crt',     name: 'crates.io',               favicon: 'crates.io',                 category: 'Developer', buildUrl: (q) => `https://crates.io/search?q=${enc(q)}` },
  { bang: '!docker',  name: 'Docker Hub',              favicon: 'hub.docker.com',            category: 'Developer', buildUrl: (q) => `https://hub.docker.com/search?q=${enc(q)}` },
  { bang: '!aw',      name: 'Arch Linux Wiki',         favicon: 'wiki.archlinux.org',        category: 'Developer', buildUrl: (q) => `https://wiki.archlinux.org/index.php?search=${enc(q)}` },

  // Maps & Travel
  { bang: '!maps',    name: 'Google Maps',             favicon: 'maps.google.com',           category: 'Maps & Travel', buildUrl: (q) => `https://maps.google.com/maps?q=${enc(q)}` },
  { bang: '!mapsg',   name: 'Google Maps',             favicon: 'maps.google.com',           category: 'Maps & Travel', buildUrl: (q) => `https://maps.google.com/maps?q=${enc(q)}` },
  { bang: '!mapsa',   name: 'Apple Maps',              favicon: 'maps.apple.com',            category: 'Maps & Travel', buildUrl: (q) => `https://maps.apple.com/maps?q=${enc(q)}` },
  { bang: '!osm',     name: 'OpenStreetMap',           favicon: 'openstreetmap.org',         category: 'Maps & Travel', buildUrl: (q) => `https://www.openstreetmap.org/search?query=${enc(q)}` },
  { bang: '!o',       name: 'OpenStreetMap',           favicon: 'openstreetmap.org',         category: 'Maps & Travel', buildUrl: (q) => `https://www.openstreetmap.org/search?query=${enc(q)}` },
  { bang: '!gm',      name: 'Google Maps',             favicon: 'maps.google.com',           category: 'Maps & Travel', buildUrl: (q) => `https://maps.google.com/maps?q=${enc(q)}` },
  { bang: '!bk',      name: 'Booking.com',             favicon: 'booking.com',               category: 'Maps & Travel', buildUrl: (q) => `https://www.booking.com/search.html?ss=${enc(q)}` },
  { bang: '!tv',      name: 'Trivago',                 favicon: 'trivago.com',               category: 'Maps & Travel', buildUrl: (q) => `https://www.trivago.com/en-GB/srl?search=${enc(q)}` },
  { bang: '!hrs',     name: 'HRS',                     favicon: 'hrs.com',                   category: 'Maps & Travel', buildUrl: (q) => `https://www.hrs.com/web3/searchresult/searchResult.action?searchParameter.destination.city=${enc(q)}` },
  { bang: '!ab',      name: 'Airbnb',                  favicon: 'airbnb.com',                category: 'Maps & Travel', buildUrl: (q) => `https://www.airbnb.com/s/${enc(q)}/homes` },
  { bang: '!sky',     name: 'Skyscanner',              favicon: 'skyscanner.net',            category: 'Maps & Travel', buildUrl: (q) => `https://www.skyscanner.net/flights-from/${enc(q)}/` },

  // AI & Tools
  { bang: '!cgpt',    name: 'ChatGPT',                 favicon: 'chat.openai.com',           category: 'AI & Tools', buildUrl: (q) => `https://chat.openai.com/?q=${enc(q)}` },
  { bang: '!perp',    name: 'Perplexity',              favicon: 'perplexity.ai',             category: 'AI & Tools', buildUrl: (q) => `https://www.perplexity.ai/search?q=${enc(q)}` },
  { bang: '!wa',      name: 'Wolfram|Alpha',           favicon: 'wolframalpha.com',          category: 'AI & Tools', buildUrl: (q) => `https://www.wolframalpha.com/input?i=${enc(q)}` },
  { bang: '!deepl',   name: 'DeepL',                   favicon: 'deepl.com',                 category: 'AI & Tools', buildUrl: (q) => `https://www.deepl.com/translator#auto/auto/${enc(q)}` },
  { bang: '!gt',      name: 'Google Translate',        favicon: 'translate.google.com',      category: 'AI & Tools', buildUrl: (q) => `https://translate.google.com/?text=${enc(q)}` },

  // News
  { bang: '!bbc',     name: 'BBC News',                favicon: 'bbc.co.uk',                 category: 'News', buildUrl: (q) => `https://www.bbc.co.uk/search?q=${enc(q)}` },
  { bang: '!nyt',     name: 'NY Times',                favicon: 'nytimes.com',               category: 'News', buildUrl: (q) => `https://www.nytimes.com/search?query=${enc(q)}` },
  { bang: '!espn',    name: 'ESPN',                    favicon: 'espn.com',                  category: 'News', buildUrl: (q) => `https://www.espn.com/search/results?q=${enc(q)}` },

  // Knowledge & Reference
  { bang: '!d',       name: 'TheFreeDictionary',       favicon: 'thefreedictionary.com',     category: 'Reference', buildUrl: (q) => `https://www.thefreedictionary.com/${enc(q)}` },
  { bang: '!cd',      name: 'Cambridge Dictionary',    favicon: 'dictionary.cambridge.org',  category: 'Reference', buildUrl: (q) => `https://dictionary.cambridge.org/search/?q=${enc(q)}` },
  { bang: '!leo',     name: 'dict.leo.org',            favicon: 'leo.org',                   category: 'Reference', buildUrl: (q) => `https://dict.leo.org/german-english/${enc(q)}` },
  { bang: '!duden',   name: 'Duden',                   favicon: 'duden.de',                  category: 'Reference', buildUrl: (q) => `https://www.duden.de/suchen/dudenonline/${enc(q)}` },
  { bang: '!lg',      name: 'Lingea',                  favicon: 'slovnik.seznam.cz',         category: 'Reference', buildUrl: (q) => `https://slovnik.seznam.cz/?q=${enc(q)}` },
  { bang: '!wh',      name: 'WikiHow',                 favicon: 'wikihow.com',               category: 'Reference', buildUrl: (q) => `https://www.wikihow.com/Special:GoogSearch?search=${enc(q)}` },
  { bang: '!gscholar',name: 'Google Scholar',          favicon: 'scholar.google.com',        category: 'Reference', buildUrl: (q) => `https://scholar.google.com/scholar?q=${enc(q)}` },

  // Archive & Misc
  { bang: '!ais',     name: 'archive.is',              favicon: 'archive.is',                category: 'Reference', buildUrl: (q) => `https://archive.is/${enc(q)}` },
  { bang: '!archive', name: 'Internet Archive',        favicon: 'archive.org',               category: 'Reference', buildUrl: (q) => `https://web.archive.org/web/*/${enc(q)}` },
  { bang: '!zillow',  name: 'Zillow',                  favicon: 'zillow.com',                category: 'Reference', buildUrl: (q) => `https://www.zillow.com/homes/${enc(q)}_rb/` },
];

export const POPULAR_BANGS = ['!w', '!r', '!y', '!a', '!gh', '!so', '!g', '!imdb'];

function bangScore(bang: QuickSearchBang, input: string): number {
  const bangLower = bang.bang.toLowerCase();
  const nameLower = bang.name.toLowerCase();
  const faviconLower = bang.favicon.toLowerCase();
  const inputLower = input.toLowerCase();

  if (bangLower === inputLower) return 1000;
  if (bangLower.startsWith(inputLower)) return 900 - bangLower.length;

  const inputNoPrefix = inputLower.startsWith('!') ? inputLower.slice(1) : inputLower;
  if (!inputNoPrefix) return 0;

  if (nameLower.startsWith(inputNoPrefix)) return 800 - nameLower.length;
  if (nameLower.includes(inputNoPrefix)) return 700 - nameLower.length;
  if (faviconLower.startsWith(inputNoPrefix)) return 600 - faviconLower.length;
  if (faviconLower.includes(inputNoPrefix)) return 500 - faviconLower.length;

  if (inputNoPrefix.length >= 4) {
    const words = nameLower.split(/[\s\-_./]+/);
    for (const word of words) {
      if (word.startsWith(inputNoPrefix.slice(0, 3))) return 400 - nameLower.length;
    }
  }

  return -1;
}

export function getBangSuggestions(input: string, limit = 8): QuickSearchBang[] {
  if (!input.startsWith('!')) return [];
  const inputLower = input.toLowerCase();
  if (inputLower.includes(' ')) return [];

  const isJustBang = inputLower === '!';

  if (isJustBang) {
    const seen = new Set<string>();
    return POPULAR_BANGS
      .map(b => QUICK_SEARCH_BANGS.find(x => x.bang === b))
      .filter((b): b is QuickSearchBang => !!b && !seen.has(b.bang) && !!seen.add(b.bang))
      .slice(0, limit);
  }

  const seen = new Set<string>();
  const scored: { bang: QuickSearchBang; score: number }[] = [];

  for (const b of QUICK_SEARCH_BANGS) {
    if (seen.has(b.bang)) continue;
    seen.add(b.bang);
    const score = bangScore(b, inputLower);
    if (score > 0) scored.push({ bang: b, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(x => x.bang);
}

export function parseBangQuery(input: string): { bang: QuickSearchBang; searchQuery: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('!')) return null;

  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return null;

  const bangStr = trimmed.slice(0, spaceIdx).toLowerCase();
  const searchQuery = trimmed.slice(spaceIdx + 1).trim();
  if (!searchQuery) return null;

  const seen = new Set<string>();
  const bang = QUICK_SEARCH_BANGS.find(b => {
    if (seen.has(b.bang)) return false;
    seen.add(b.bang);
    return b.bang === bangStr;
  });

  if (!bang) return null;
  return { bang, searchQuery };
}
