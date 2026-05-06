export type StopwatchMode = 'stopwatch' | 'timer';

function containsExactWord(query: string, keyword: string): boolean {
  const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])` + escapedKw + `([^\\p{L}\\p{N}]|$)`, 'iu');
  return regex.test(query);
}

const STOPWATCH_KEYWORDS: Record<string, string[]> = {
  en: ['stopwatch', 'stop watch', 'chronograph', 'chrono', 'countdown', 'elapsed time'],
  de: ['stoppuhr', 'stopp uhr', 'chronograph', 'chrono', 'zeitmesser', 'zeitmessung', 'zeitnehmer'],
  fr: ['chronomètre', 'chrono', 'chronographe', 'compte-temps', 'montre chrono'],
  es: ['cronómetro', 'cronometro', 'crono', 'cronógrafo'],
  it: ['cronometro', 'crono', 'cronografo', 'contasecondi'],
  pt: ['cronômetro', 'cronometro', 'crono', 'cronógrafo'],
  nl: ['stopwatch', 'chronograaf', 'chrono', 'tijdmeter'],
  pl: ['stoper', 'stopwatch', 'chronometr', 'chronograf'],
  sv: ['stoppur', 'kronometer', 'tidmätare'],
  da: ['stopur', 'kronometer', 'tidtagning'],
  bg: ['хронометър', 'секундомер', 'хронограф'],
  hr: ['štoperica', 'kronometar', 'mjerač vremena'],
  cs: ['stopky', 'chronometr'],
  el: ['χρονόμετρο', 'χρονόγραφος'],
  sl: ['štoparica', 'kronometer']
};

const TIMER_KEYWORDS: Record<string, string[]> = {
  en: ['timer', 'countdown', 'count down', 'alarm', 'set timer', 'countdown timer', 'minute timer', 'second timer'],
  de: ['timer', 'countdown', 'count down', 'alarm', 'küchentimer', 'zeitgeber', 'eieruhr', 'kurzzeitwecker'],
  fr: ['minuteur', 'minuterie', 'compte à rebours', 'timer', 'alarme', 'décompte'],
  es: ['temporizador', 'cuenta regresiva', 'timer', 'alarma', 'contador regresivo'],
  it: ['timer', 'conto alla rovescia', 'sveglia', 'temporizzatore', 'contatore'],
  pt: ['temporizador', 'contagem regressiva', 'timer', 'alarme'],
  nl: ['timer', 'afteller', 'countdown', 'wekker', 'aftelling'],
  pl: ['timer', 'odliczanie', 'stoper', 'minutnik', 'alarm'],
  sv: ['timer', 'nedräkning', 'larm'],
  da: ['timer', 'nedtælling', 'alarm'],
  bg: ['таймер', 'обратно броене', 'аларма'],
  hr: ['odbrojavanje', 'timer', 'alarm', 'brojač'],
  cs: ['časovač', 'odpočítávání', 'minutka', 'budík'],
  el: ['αντίστροφη μέτρηση', 'χρονόμετρο', 'ειδοποίηση', 'ξυπνητήρι', 'χρονόμετρο αντίστροφης μέτρησης'],
  sl: ['časovnik', 'odštevanje', 'alarm', 'timer']
};

const CLOCK_KEYWORDS: Record<string, string[]> = {
  en: ['clock', 'time', 'watch'],
  de: ['uhr', 'zeit', 'uhrzeit'],
  fr: ['horloge', 'heure', 'montre'],
  es: ['reloj', 'hora', 'tiempo'],
  it: ['orologio', 'ora', 'tempo'],
  pt: ['relógio', 'hora', 'tempo'],
  nl: ['klok', 'tijd', 'horloge'],
  pl: ['zegar', 'czas', 'zegarek'],
  sv: ['klocka', 'tid', 'ur'],
  da: ['ur', 'tid', 'klokke'],
  bg: ['часовник', 'време'],
  hr: ['sat', 'vrijeme'],
  cs: ['hodiny', 'čas', 'hodinky'],
  el: ['ρολόι', 'ώρα', 'χρόνος'],
  sl: ['ura', 'čas']
};

export function isStopwatchQuery(query: string): boolean {
  if (!query?.trim()) return false;
  const q = query.trim().toLowerCase();
  for (const kws of Object.values(STOPWATCH_KEYWORDS)) {
    for (const kw of kws) {
      if (containsExactWord(q, kw)) return true;
    }
  }
  return false;
}

export function isTimerQuery(query: string): boolean {
  if (!query?.trim()) return false;
  const q = query.trim().toLowerCase();
  for (const kws of Object.values(TIMER_KEYWORDS)) {
    for (const kw of kws) {
      if (containsExactWord(q, kw)) return true;
    }
  }
  return false;
}

export function isStopwatchOrTimerQuery(query: string): StopwatchMode | null {
  if (!query?.trim()) return null;
  const q = query.trim().toLowerCase();

  if (isTimerQuery(q)) return 'timer';
  if (isStopwatchQuery(q)) return 'stopwatch';

  for (const kws of Object.values(CLOCK_KEYWORDS)) {
    for (const kw of kws) {
      if (containsExactWord(q, kw)) return 'stopwatch';
    }
  }

  return null;
}

export interface ParsedTimerDuration {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function parseTimerDuration(query: string): ParsedTimerDuration | null {
  const q = query.trim().toLowerCase();

  let hours = 0, minutes = 0, seconds = 0;
  let found = false;

  // hr: sat/sati, cs: hodin/hodiny, el: ώρα/ώρες, sl: ur/ure, bg: час/часа
  const hMatch = q.match(/(\d+)\s*(?:h(?:our|ours|r|rs)?|stunden?|heure?s?|hora?s?|uur|godzin[ay]?|sat[i]?|hodin[ay]?|ώρ[αες]+|ur[ae]?|час(?:а|ове)?)/i);
  // hr/cs/sl: minut/minuta, el: λεπτ, bg: минут
  const mMatch = q.match(/(\d+)\s*(?:m(?:in(?:ute|utes|s)?)?|minuten?|minutes?|minuto?s?|minut[ayi]?|λεπτ[όά]+|минут[аи]?)/i);
  // hr/cs/sl: sekund/sekunda, el: δευτερόλεπτ, bg: секунд
  const sMatch = q.match(/(\d+)\s*(?:s(?:ec(?:ond|onds|s)?)?|sekunden?|seconde?s?|segundo?s?|sekund[ayi]?|δευτερόλεπτ[οα]+|секунд[аи]?)/i);

  if (hMatch) { hours = parseInt(hMatch[1]); found = true; }
  if (mMatch) { minutes = parseInt(mMatch[1]); found = true; }
  if (sMatch) { seconds = parseInt(sMatch[1]); found = true; }

  if (!found) {
    const justMins = q.match(/^(?:set\s+(?:a\s+)?)?(?:timer\s+(?:for\s+)?|alarm\s+(?:for\s+)?)?(\d+)\s*(?:minute|minutes|min|mins?|m)$/i);
    if (justMins) { minutes = parseInt(justMins[1]); found = true; }

    const justSecs = q.match(/^(?:set\s+(?:a\s+)?)?(?:timer\s+(?:for\s+)?)?(\d+)\s*(?:second|seconds|secs?|s)$/i);
    if (justSecs) { seconds = parseInt(justSecs[1]); found = true; }
  }

  if (!found) return null;

  const total = hours * 3600 + minutes * 60 + seconds;
  if (total <= 0) return null;

  return { totalSeconds: total, hours, minutes, seconds };
}