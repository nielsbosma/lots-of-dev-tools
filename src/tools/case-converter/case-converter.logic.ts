export function toWords(input: string): string[] {
  if (!input) return [];

  // Split on underscores, hyphens, and spaces
  let words = input.split(/[_\-\s]+/);

  // Further split camelCase and PascalCase
  const result: string[] = [];
  for (const word of words) {
    if (!word) continue;

    // Split on uppercase letters following lowercase letters
    const parts = word.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
    result.push(...parts.filter((p) => p));
  }

  return result.map((w) => w.toLowerCase());
}

export function toCamelCase(input: string): string {
  const words = toWords(input);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0];

  return (
    words[0] +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
  );
}

export function toSnakeCase(input: string): string {
  const words = toWords(input);
  return words.join("_");
}

export function toKebabCase(input: string): string {
  const words = toWords(input);
  return words.join("-");
}

export function toPascalCase(input: string): string {
  const words = toWords(input);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

export function toConstantCase(input: string): string {
  const words = toWords(input);
  return words.map((w) => w.toUpperCase()).join("_");
}

export function toTitleCase(input: string): string {
  const words = toWords(input);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function detectCase(input: string): string {
  if (!input) return "empty";

  // Check for CONSTANT_CASE (all uppercase with underscores)
  if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.test(input)) {
    return "CONSTANT_CASE";
  }

  // Check for snake_case (lowercase with underscores)
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(input)) {
    return "snake_case";
  }

  // Check for kebab-case (lowercase with hyphens)
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(input)) {
    return "kebab-case";
  }

  // Check for PascalCase (starts with uppercase, no separators)
  if (/^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(input)) {
    return "PascalCase";
  }

  // Check for camelCase (starts with lowercase, has uppercase letters)
  if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(input)) {
    return "camelCase";
  }

  // Check for Title Case (words separated by spaces, each capitalized)
  if (/^[A-Z][a-z0-9]*(\s[A-Z][a-z0-9]*)*$/.test(input)) {
    return "Title Case";
  }

  return "unknown";
}
