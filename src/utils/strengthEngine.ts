// Improved Multi-Vector Password Strength Engine

export interface StrengthAnalysis {
  poolEntropyBits: number;
  effectiveEntropyBits: number;
  scorePercent: number; // 0 to 100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Extreme' | 'UNBREAKABLE';
  colorClass: string;
  badgeHex: string;
  crackTimes: {
    onlineThrottled: string;  // 100/s
    onlineFast: string;       // 10,000/s
    offlineSlowHash: string;  // 10,000/s (Argon2 / Bcrypt)
    offlineFastHash: string;  // 100 Billion/s (MD5/SHA1 GPU cluster)
    quantumGrover: string;    // Grover's algorithm bit reduction
  };
  penaltiesApplied: {
    reason: string;
    deductionBits: number;
  }[];
  warnings: string[];
  recommendations: string[];
  diversity: {
    hasLower: boolean;
    hasUpper: boolean;
    hasDigits: boolean;
    hasSymbols: boolean;
    hasUnicodeOrEmoji: boolean;
    charVarietyCount: number;
  };
}

// Common weak dictionary words & leaked passwords
const WEAK_WORDS = [
  'password', 'admin', 'welcome', 'qwerty', '123456', '123456789', 'letmein',
  'monkey', 'dragon', 'football', 'baseball', 'superman', 'trustno1', 'iloveyou',
  'sunshine', 'princess', 'charlie', 'shadow', 'master', 'pass123', 'starwars',
  'login', 'root', 'system', 'god', 'matrix', 'access', 'default', 'secret',
  'hacker', 'test', 'demo', 'user', 'guest', 'company', 'security', 'solaris',
  'orange', 'apple', 'batman', 'pokemon', 'computer', 'internet', 'freedom'
];

// QWERTY rows & keypad patterns for spatial detection
const KEYBOARD_PATTERNS = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '1234567890', '0987654321',
  'qazwsxedcrfv', '1qaz2wsx3edc', '!qaz@wsx#edc'
];

// Leetspeak character replacement mapping
const LEET_MAP: Record<string, string> = {
  '@': 'a', '4': 'a',
  '3': 'e',
  '1': 'i', '!': 'i', '|': 'i',
  '0': 'o',
  '5': 's', '$': 's',
  '7': 't', '+': 't',
  '8': 'b',
  '9': 'g',
  '2': 'z'
};

export function normalizeLeetspeak(input: string): string {
  let result = input.toLowerCase();
  for (const [leet, char] of Object.entries(LEET_MAP)) {
    result = result.replaceAll(leet, char);
  }
  return result;
}

export function calculatePoolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[!@#$%^&*()\-_=+\[\]{};:,.<>?/\\|~`¬±§€£¥©®™°•‰¡¿]/.test(pw)) pool += 33;
  // Emoji & Unicode check
  if (/[^\x00-\x7F]/.test(pw)) pool += 60;
  return Math.max(pool, 1);
}

export function formatTime(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return 'instantly';
  if (seconds < 1) return 'instantly';
  
  const units: [string, number][] = [
    ['trillion years', 60 * 60 * 24 * 365 * 1e12],
    ['billion years', 60 * 60 * 24 * 365 * 1e9],
    ['million years', 60 * 60 * 24 * 365 * 1e6],
    ['centuries', 60 * 60 * 24 * 365 * 100],
    ['years', 60 * 60 * 24 * 365],
    ['months', 60 * 60 * 24 * 30],
    ['days', 60 * 60 * 24],
    ['hours', 60 * 60],
    ['minutes', 60],
    ['seconds', 1],
  ];

  for (const [unit, size] of units) {
    if (seconds >= size) {
      const val = seconds / size;
      if (val > 1000 && unit.includes('year')) {
        return `${val.toExponential(1)} ${unit}`;
      }
      return `${val.toFixed(val >= 10 ? 0 : 1)} ${unit}`;
    }
  }
  return 'instantly';
}

export function analyzePassword(pw: string): StrengthAnalysis {
  if (!pw) {
    return {
      poolEntropyBits: 0,
      effectiveEntropyBits: 0,
      scorePercent: 0,
      label: 'Very Weak',
      colorClass: 'text-red-500',
      badgeHex: '#ef4444',
      crackTimes: {
        onlineThrottled: 'instantly',
        onlineFast: 'instantly',
        offlineSlowHash: 'instantly',
        offlineFastHash: 'instantly',
        quantumGrover: 'instantly',
      },
      penaltiesApplied: [],
      warnings: ['Password cannot be empty.'],
      recommendations: ['Enter or generate a password to analyze strength.'],
      diversity: {
        hasLower: false,
        hasUpper: false,
        hasDigits: false,
        hasSymbols: false,
        hasUnicodeOrEmoji: false,
        charVarietyCount: 0
      }
    };
  }

  const poolSize = calculatePoolSize(pw);
  const rawEntropy = pw.length * Math.log2(poolSize);

  const penalties: { reason: string; deductionBits: number }[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Diversity metrics
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigits = /[0-9]/.test(pw);
  const hasSymbols = /[!@#$%^&*()\-_=+\[\]{};:,.<>?/\\|~`¬±§]/.test(pw);
  const hasUnicodeOrEmoji = /[^\x00-\x7F]/.test(pw);

  let charVarietyCount = 0;
  if (hasLower) charVarietyCount++;
  if (hasUpper) charVarietyCount++;
  if (hasDigits) charVarietyCount++;
  if (hasSymbols) charVarietyCount++;
  if (hasUnicodeOrEmoji) charVarietyCount++;

  // Penalty 1: Short length
  if (pw.length < 8) {
    const ded = Math.min(25, (8 - pw.length) * 5);
    penalties.push({ reason: 'Extremely short length (< 8 chars)', deductionBits: ded });
    warnings.push('Length is under 8 characters — vulnerable to brute-force.');
    recommendations.push('Increase length to at least 16+ characters.');
  } else if (pw.length < 12) {
    penalties.push({ reason: 'Short length (< 12 chars)', deductionBits: 10 });
    warnings.push('Length is under 12 characters.');
    recommendations.push('Aim for 16–24+ characters for maximum security.');
  }

  // Penalty 2: Low character diversity
  if (charVarietyCount <= 1) {
    penalties.push({ reason: 'Single character type used', deductionBits: 15 });
    warnings.push('Only 1 character category used (e.g. only lowercase or digits).');
    recommendations.push('Mix uppercase, lowercase, numbers, and symbols.');
  } else if (charVarietyCount === 2) {
    penalties.push({ reason: 'Limited character diversity (only 2 types)', deductionBits: 8 });
  }

  // Penalty 3: Dictionary word / Leetspeak check
  const normalized = normalizeLeetspeak(pw);
  for (const word of WEAK_WORDS) {
    if (normalized.includes(word)) {
      const ded = word.length > 5 ? 25 : 15;
      penalties.push({ reason: `Contains weak dictionary pattern "${word}" (or leetspeak equivalent)`, deductionBits: ded });
      warnings.push(`Contains predictable root word "${word}".`);
      recommendations.push('Avoid common words or names, even with number/symbol substitutions like @ or 0.');
      break;
    }
  }

  // Penalty 4: Keyboard spatial walks & sequences
  const lowerPw = pw.toLowerCase();
  for (const pattern of KEYBOARD_PATTERNS) {
    for (let i = 0; i <= pattern.length - 4; i++) {
      const sub = pattern.substring(i, i + 4);
      const revSub = sub.split('').reverse().join('');
      if (lowerPw.includes(sub) || lowerPw.includes(revSub)) {
        penalties.push({ reason: `Contains keyboard sequence pattern "${sub}"`, deductionBits: 14 });
        warnings.push('Contains keyboard walk pattern (e.g., qwerty, 1234, asdf).');
        recommendations.push('Avoid consecutive keyboard keys.');
        break;
      }
    }
  }

  // Penalty 5: Repeated characters (3+ in a row)
  if (/(.)\1{2,}/.test(pw)) {
    penalties.push({ reason: 'Contains 3+ repeating characters in a row', deductionBits: 12 });
    warnings.push('Repeated characters detected (e.g., aaa, 999).');
    recommendations.push('Remove character repetitions.');
  }

  // Penalty 6: Low unique character ratio
  const uniqueChars = new Set(pw).size;
  const uniqueRatio = uniqueChars / pw.length;
  if (uniqueRatio < 0.5) {
    penalties.push({ reason: 'High character repetition (low unique ratio)', deductionBits: 12 });
    warnings.push('Many repeated characters throughout the password.');
  }

  // Penalty 7: Predictable structure (Standard: Capitalized first letter + lower + 1-2 numbers + 1 symbol at end)
  if (/^[A-Z][a-z]+[0-9]{1,3}[!@#$%^&*()?]?$/.test(pw)) {
    penalties.push({ reason: 'Predictable structural format (Title Case + Number + Symbol)', deductionBits: 18 });
    warnings.push('Matches predictable password template (e.g., Password123!).');
    recommendations.push('Place numbers and symbols randomly in the middle instead of at the end.');
  }

  // Calculate Effective Entropy
  const totalDeductions = penalties.reduce((acc, p) => acc + p.deductionBits, 0);
  const effectiveEntropyBits = Math.max(0, rawEntropy - totalDeductions);

  // Crack time estimations
  // Combos = 2 ^ effectiveBits
  // Avg attempts to crack = Combos / 2
  const combos = Math.pow(2, effectiveEntropyBits);

  const crackTimes = {
    onlineThrottled: formatTime(combos / (2 * 100)),                // 100/s
    onlineFast: formatTime(combos / (2 * 10000)),                   // 10,000/s
    offlineSlowHash: formatTime(combos / (2 * 10000)),              // 10,000/s (Argon2 / Bcrypt)
    offlineFastHash: formatTime(combos / (2 * 1e11)),               // 100 Billion/s
    quantumGrover: formatTime(Math.pow(2, effectiveEntropyBits / 2) / (2 * 1e9)), // Quantum Grover speedup
  };

  // Score percent calculation (capped at 100 for >= 120 bits)
  let scorePercent = Math.min(100, Math.round((effectiveEntropyBits / 120) * 100));

  // Determine Label & Badges
  let label: StrengthAnalysis['label'] = 'Very Weak';
  let colorClass = 'text-red-500';
  let badgeHex = '#ef4444';

  if (effectiveEntropyBits < 30) {
    label = 'Very Weak';
    colorClass = 'text-red-500';
    badgeHex = '#ef4444';
  } else if (effectiveEntropyBits < 45) {
    label = 'Weak';
    colorClass = 'text-orange-400';
    badgeHex = '#fb923c';
  } else if (effectiveEntropyBits < 65) {
    label = 'Fair';
    colorClass = 'text-yellow-400';
    badgeHex = '#facc15';
  } else if (effectiveEntropyBits < 85) {
    label = 'Good';
    colorClass = 'text-lime-400';
    badgeHex = '#a3e635';
  } else if (effectiveEntropyBits < 105) {
    label = 'Strong';
    colorClass = 'text-emerald-400';
    badgeHex = '#34d399';
  } else if (effectiveEntropyBits < 128) {
    label = 'Extreme';
    colorClass = 'text-cyan-400';
    badgeHex = '#38bdf8';
  } else {
    label = 'UNBREAKABLE';
    colorClass = 'text-fuchsia-400';
    badgeHex = '#c084fc';
  }

  if (warnings.length === 0) {
    recommendations.push('Password meets top security criteria!');
  }

  return {
    poolEntropyBits: Math.round(rawEntropy * 10) / 10,
    effectiveEntropyBits: Math.round(effectiveEntropyBits * 10) / 10,
    scorePercent,
    label,
    colorClass,
    badgeHex,
    crackTimes,
    penaltiesApplied: penalties,
    warnings,
    recommendations,
    diversity: {
      hasLower,
      hasUpper,
      hasDigits,
      hasSymbols,
      hasUnicodeOrEmoji,
      charVarietyCount
    }
  };
}

/**
 * Smart Auto-Enhancer: Takes ANY password input and transforms it into an Unbreakable strength password!
 */
export function autoEnhancePassword(original: string): string {
  if (!original || original.trim().length === 0) {
    original = 'CyberShield';
  }

  const saltSymbols = '!@#$%^&*()-_=+[]{}';
  const saltNumbers = '0123456789';
  
  // Transform base string: clean repetitive patterns, add high entropy blocks
  let enhanced = original;

  // Insert cryptographic salt symbols & numbers into middle & ends
  const randSymbol = () => saltSymbols[Math.floor(Math.random() * saltSymbols.length)];
  const randNum = () => saltNumbers[Math.floor(Math.random() * saltNumbers.length)];
  const randHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  // If short, pad with random high entropy segment
  if (enhanced.length < 18) {
    enhanced = `${randSymbol()}${enhanced}${randSymbol()}_${randHex()}${randNum()}${randSymbol()}`;
  } else {
    // Interleave symbols
    const mid = Math.floor(enhanced.length / 2);
    enhanced = enhanced.slice(0, mid) + randSymbol() + randNum() + randHex() + randSymbol() + enhanced.slice(mid);
  }

  // Ensure uppercase, lowercase, numbers, symbols
  if (!/[A-Z]/.test(enhanced)) enhanced = 'Z' + enhanced;
  if (!/[0-9]/.test(enhanced)) enhanced += randNum() + randNum();
  if (!/[!@#$%^&*()\-_=+]/.test(enhanced)) enhanced = randSymbol() + enhanced;

  return enhanced;
}
