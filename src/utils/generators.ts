// Comprehensive Password & Passphrase Generation Engine

export const AMBIGUOUS_CHARS = "il1Lo0O";
export const SIMILAR_SYMBOLS = "|`'\"";
export const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|~";
export const EXTENDED_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|~`¬±§€£¥©®™°•‰¡¿";
export const BRACKETS = "()[]{}<>";
export const EMOJI_POOL = Array.from("😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🙌🎉🔥✨🚀🛡️🔐💎⚡🌟🌈👾🚀🛡️🔮✨⚡");
export const HEX_CHARS = "0123456789ABCDEF";

export const BASE_WORDS = [
  "nebula", "comet", "photon", "quartz", "falcon", "cipher", "cobalt", "delta",
  "ember", "fjord", "glacier", "harbor", "ignite", "jungle", "karma", "lunar",
  "meteor", "nova", "onyx", "prism", "quasar", "raven", "sable", "titan",
  "umbra", "vertex", "willow", "xenon", "yonder", "zephyr", "atlas", "brave",
  "crimson", "drift", "echo", "flare", "granite", "horizon", "iris", "jade",
  "kinetic", "legend", "matrix", "nexus", "orbit", "pulse", "quantum", "radiant",
  "shadow", "thunder", "utopia", "vortex", "zenith", "starlight", "hyperion"
];

export interface RandomOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  symbolSet?: string;
  brackets?: boolean;
  emoji?: boolean;
  unicodeExtra?: boolean;
  hexOnly?: boolean;
  excludeAmbiguous?: boolean;
  excludeSimilarSymbols?: boolean;
  noRepeat?: boolean;
  forceAllTypes?: boolean;
  customChars?: string;
  excludeChars?: string;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
}

// Cryptographically secure random integer in range [0, max)
function getRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

// Cryptographically secure choice from array or string
function secureChoice<T>(items: T[] | string): T {
  const idx = getRandomInt(items.length);
  return items[idx] as T;
}

// Fisher-Yates cryptographically secure shuffle
function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildPool(opts: RandomOptions): string {
  if (opts.hexOnly) {
    return HEX_CHARS;
  }

  let pool = "";
  if (opts.lower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (opts.upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.digits) pool += "0123456789";
  if (opts.symbols) pool += opts.symbolSet || DEFAULT_SYMBOLS;
  if (opts.brackets) pool += BRACKETS;
  if (opts.emoji) pool += EMOJI_POOL.join("");
  if (opts.unicodeExtra) pool += "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüý";

  if (opts.excludeAmbiguous) {
    pool = pool.split("").filter(c => !AMBIGUOUS_CHARS.includes(c)).join("");
  }
  if (opts.excludeSimilarSymbols) {
    pool = pool.split("").filter(c => !SIMILAR_SYMBOLS.includes(c)).join("");
  }
  if (opts.customChars) {
    pool += opts.customChars;
  }
  if (opts.excludeChars) {
    const exSet = new Set(opts.excludeChars.split(""));
    pool = pool.split("").filter(c => !exSet.has(c)).join("");
  }

  // Deduplicate pool
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const c of pool) {
    if (!seen.has(c)) {
      seen.add(c);
      deduped.push(c);
    }
  }

  return deduped.join("");
}

export function generateRandomPassword(opts: RandomOptions): { password: string; poolSize: number } {
  const pool = buildPool(opts);
  if (!pool || pool.length === 0) {
    throw new Error("Character pool is empty. Please enable at least one character type.");
  }

  const length = Math.max(4, opts.length || 16);

  const requiredGroups: string[][] = [];
  if (!opts.hexOnly) {
    if (opts.lower) requiredGroups.push("abcdefghijklmnopqrstuvwxyz".split("").filter(c => pool.includes(c)));
    if (opts.upper) requiredGroups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(c => pool.includes(c)));
    if (opts.digits) requiredGroups.push("0123456789".split("").filter(c => pool.includes(c)));
    if (opts.symbols) requiredGroups.push((opts.symbolSet || DEFAULT_SYMBOLS).split("").filter(c => pool.includes(c)));
  }
  const validRequiredGroups = requiredGroups.filter(g => g.length > 0);

  if (opts.forceAllTypes && validRequiredGroups.length > length) {
    throw new Error("Password length is too short to force all selected character types.");
  }

  if (opts.noRepeat && length > pool.length) {
    throw new Error(`Length (${length}) exceeds unique pool size (${pool.length}) in No-Repeat mode.`);
  }

  const resultChars: string[] = [];

  if (opts.forceAllTypes) {
    for (const group of validRequiredGroups) {
      resultChars.push(secureChoice(group));
    }
  }

  const remaining = length - resultChars.length;

  if (opts.noRepeat) {
    const available = pool.split("").filter(c => !resultChars.includes(c));
    const shuffledAvailable = secureShuffle(available);
    resultChars.push(...shuffledAvailable.slice(0, remaining));
  } else {
    for (let i = 0; i < remaining; i++) {
      resultChars.push(secureChoice(pool));
    }
  }

  const finalPw = secureShuffle(resultChars).join("");
  return { password: finalPw, poolSize: pool.length };
}

export function generatePatternPassword(pattern: string, symbolSet: string = DEFAULT_SYMBOLS): string {
  const mapping: Record<string, string> = {
    "L": "abcdefghijklmnopqrstuvwxyz",
    "U": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "D": "0123456789",
    "S": symbolSet,
    "A": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("").filter(c => !AMBIGUOUS_CHARS.includes(c)).join(""),
    "X": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" + symbolSet,
  };

  const result: string[] = [];
  for (const ch of pattern) {
    if (mapping[ch] && mapping[ch].length > 0) {
      result.push(secureChoice(mapping[ch]));
    } else {
      result.push(ch);
    }
  }
  return result.join("");
}

export function generatePassphrase(opts: PassphraseOptions): string {
  const wordCount = Math.max(2, opts.wordCount || 4);
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = secureChoice(BASE_WORDS);
    if (opts.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  const parts = [...words];
  if (opts.includeNumber) {
    const randNum = (getRandomInt(9000) + 1000).toString();
    parts.push(randNum);
  }
  if (opts.includeSymbol) {
    parts.push(secureChoice(DEFAULT_SYMBOLS));
  }

  const shuffledParts = secureShuffle(parts);
  return shuffledParts.join(opts.separator);
}

export function generatePronounceablePassword(length: number = 12): string {
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  const out: string[] = [];
  let useConsonant = getRandomInt(2) === 1;

  while (out.join("").length < length) {
    out.push(secureChoice(useConsonant ? consonants : vowels));
    useConsonant = !useConsonant;
  }

  let s = out.join("").slice(0, length);
  s = s.charAt(0).toUpperCase() + s.slice(1);
  s += (getRandomInt(90) + 10).toString();
  s += secureChoice("!@#$%&*?");
  return s;
}

export function generateBulkPasswords(count: number, opts: RandomOptions): string[] {
  const list: string[] = [];
  const safeCount = Math.min(1000, Math.max(1, count));
  for (let i = 0; i < safeCount; i++) {
    const { password } = generateRandomPassword(opts);
    list.push(password);
  }
  return list;
}
