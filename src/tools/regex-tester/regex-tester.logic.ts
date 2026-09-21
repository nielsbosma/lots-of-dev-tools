export interface RegexMatch {
  index: number;
  value: string;
  groups: string[]; // numbered captures, "" for non-participating
  named: Record<string, string>; // empty when the pattern has no named groups
}

export interface RegexResult {
  matches: RegexMatch[];
  error?: string; // invalid pattern message from the RegExp constructor
  truncated?: boolean; // guard tripped (match cap or time cap)
}

export interface ReplaceResult {
  result: string;
  error?: string;
}

// Guard against runaway patterns: stop iterating global matches after this many
// matches or this many milliseconds, whichever comes first. This does not (and
// cannot, from JS-level code) interrupt a single pathological exec() call caused
// by catastrophic backtracking — only a Web Worker with terminate() could do that.
const MAX_MATCHES = 10_000;
const MAX_MS = 1000;

function toRegexMatch(m: RegExpExecArray): RegexMatch {
  const groups: string[] = [];
  for (let i = 1; i < m.length; i++) {
    groups.push(m[i] ?? "");
  }
  const named: Record<string, string> = {};
  if (m.groups) {
    for (const [key, value] of Object.entries(m.groups)) {
      named[key] = value ?? "";
    }
  }
  return {
    index: m.index,
    value: m[0],
    groups,
    named,
  };
}

export function runRegex(pattern: string, flags: string, input: string): RegexResult {
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }

  if (!re.global) {
    const m = re.exec(input);
    return { matches: m ? [toRegexMatch(m)] : [] };
  }

  // matchAll's iterator already advances lastIndex by one on a zero-length match
  // (per spec), so /a*/g against "bbb" terminates on its own. The loop below only
  // needs to guard against too many matches or too much elapsed time.
  const matches: RegexMatch[] = [];
  const startTime = Date.now();
  let truncated = false;

  for (const m of input.matchAll(re)) {
    matches.push(toRegexMatch(m));
    if (matches.length >= MAX_MATCHES || Date.now() - startTime >= MAX_MS) {
      truncated = true;
      break;
    }
  }

  return { matches, truncated: truncated || undefined };
}

export function runReplace(
  pattern: string,
  flags: string,
  input: string,
  replacement: string,
): ReplaceResult {
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { result: input, error: (e as Error).message };
  }
  return { result: input.replace(re, replacement) };
}
