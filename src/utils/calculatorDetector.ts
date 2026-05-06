const CALCULATOR_KEYWORDS: Record<string, string[]> = {
  en: ['calculator', 'calculate', 'calc', 'math', 'compute', 'calculation', 'arithmetic'],
  de: ['rechner', 'rechnen', 'kalkulator', 'berechnen', 'berechnung', 'mathe', 'mathematik'],
  fr: ['calculatrice', 'calculer', 'calcul', 'calculateur', 'arithmétique'],
  es: ['calculadora', 'calcular', 'cálculo', 'calculatrices'],
  it: ['calcolatrice', 'calcolare', 'calcolo', 'calcolatore'],
  pt: ['calculadora', 'calcular', 'cálculo'],
  nl: ['rekenmachine', 'berekenen', 'rekenen', 'berekening'],
  pl: ['kalkulator', 'obliczenia', 'obliczyć', 'rachunek'],
  sv: ['kalkylator', 'räknare', 'beräkna', 'kalkyl'],
  da: ['lommeregner', 'beregne', 'beregning', 'regner'],
  bg: ['калкулатор', 'калкулация', 'изчисли', 'математика'],
  hr: ['kalkulator', 'izračunati', 'izračun', 'matematika'],
  cs: ['kalkulačka', 'vypočítat', 'výpočet', 'počítačka', 'matematika'],
  el: ['αριθμομηχανή', 'υπολογισμός', 'υπολογίσει', 'μαθηματικά'],
  sl: ['kalkulator', 'izračunati', 'izračun', 'matematika']
};

const MATH_EXPRESSION_REGEX = /^[\d\s\+\-\*\/\^\(\)\.\,\%√π×÷=]{3,}$/;

const EQUATION_PATTERNS = [
  /\d+\s*[\+\-\*\/×÷]\s*\d+/,
  /\d+\s*\^\s*\d+/,
  /sqrt\s*\(/i,
  /(?:^|[^\p{L}\p{N}])(?:sin|cos|tan|log|ln)(?:[^\p{L}\p{N}]|$)/iu,
  /\d+\s*%\s*of\s*\d+/i,
  /what\s+is\s+\d+/i,
  /how\s+much\s+is\s+\d+/i,
  /(\d+[\+\-\*\/]\d+)/,
  /\d+\s*[\+\-]\s*\d+\s*[\+\-\*\/]\s*\d+/,
];

function matchesWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}])` + escaped + `([^\\p{L}\\p{N}]|$)`, 'iu');
  return regex.test(text);
}

export function isCalculatorQuery(query: string): boolean {
  if (!query?.trim()) return false;
  const q = query.trim().toLowerCase();

  for (const keywords of Object.values(CALCULATOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (matchesWholeWord(q, kw)) {
        return true;
      }
    }
  }

  if (MATH_EXPRESSION_REGEX.test(q)) return true;

  for (const pattern of EQUATION_PATTERNS) {
    if (pattern.test(q)) return true;
  }

  return false;
}

export function extractExpressionFromQuery(query: string): string {
  const q = query.trim().toLowerCase();

  for (const keywords of Object.values(CALCULATOR_KEYWORDS)) {
    const sortedKws = [...keywords].sort((a, b) => b.length - a.length);
    
    for (const kw of sortedKws) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}(?=[^\\p{L}\\p{N}]|$)`, 'iu');
      
      if (regex.test(q)) {
        const rest = query.trim().substring(kw.length).trim();
        const cleanedRest = rest.replace(/^[:\-]\s*/, '').trim();
        if (cleanedRest) return cleanedRest;
      }
    }
  }

  const afterWhat = query.match(/what\s+is\s+(.*)/i);
  if (afterWhat) return afterWhat[1].trim();

  const afterHow = query.match(/how\s+much\s+is\s+(.*)/i);
  if (afterHow) return afterHow[1].trim();

  return query.trim();
}