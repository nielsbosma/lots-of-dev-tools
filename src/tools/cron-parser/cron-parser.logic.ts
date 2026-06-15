export interface CronParts {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

export interface CronField {
  raw: string;
  values: number[];
}

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DAY_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export function parseCronExpression(expr: string): CronParts {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(
      `Invalid cron expression: expected 5 fields (minute hour day-of-month month day-of-week), got ${fields.length}`
    );
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

  return {
    minute: parseField(minute, 0, 59, "minute"),
    hour: parseField(hour, 0, 23, "hour"),
    dayOfMonth: parseField(dayOfMonth, 1, 31, "day-of-month"),
    month: parseField(month, 1, 12, "month", MONTH_NAMES),
    dayOfWeek: parseField(dayOfWeek, 0, 6, "day-of-week", DAY_NAMES),
  };
}

function parseField(
  field: string,
  min: number,
  max: number,
  name: string,
  nameMap?: Record<string, number>
): CronField {
  const values: Set<number> = new Set();

  if (field === "*") {
    for (let i = min; i <= max; i++) {
      values.add(i);
    }
    return { raw: field, values: Array.from(values).sort((a, b) => a - b) };
  }

  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step, 10);
      if (isNaN(stepNum) || stepNum <= 0) {
        throw new Error(`Invalid step value in ${name}: ${step}`);
      }

      let rangeMin = min;
      let rangeMax = max;

      if (range !== "*") {
        if (range.includes("-")) {
          const [start, end] = range.split("-");
          rangeMin = resolveValue(start, nameMap);
          rangeMax = resolveValue(end, nameMap);
        } else {
          rangeMin = resolveValue(range, nameMap);
          rangeMax = max;
        }
      }

      for (let i = rangeMin; i <= rangeMax; i += stepNum) {
        if (i >= min && i <= max) {
          values.add(i);
        }
      }
    } else if (part.includes("-")) {
      const [start, end] = part.split("-");
      const startNum = resolveValue(start, nameMap);
      const endNum = resolveValue(end, nameMap);

      if (startNum < min || startNum > max) {
        throw new Error(`${name} value ${startNum} out of range [${min}-${max}]`);
      }
      if (endNum < min || endNum > max) {
        throw new Error(`${name} value ${endNum} out of range [${min}-${max}]`);
      }
      if (startNum > endNum) {
        throw new Error(`Invalid range in ${name}: ${start}-${end}`);
      }

      for (let i = startNum; i <= endNum; i++) {
        values.add(i);
      }
    } else {
      const num = resolveValue(part, nameMap);
      if (num < min || num > max) {
        throw new Error(`${name} value ${num} out of range [${min}-${max}]`);
      }
      values.add(num);
    }
  }

  if (values.size === 0) {
    throw new Error(`No valid values parsed for ${name}: ${field}`);
  }

  return { raw: field, values: Array.from(values).sort((a, b) => a - b) };
}

function resolveValue(value: string, nameMap?: Record<string, number>): number {
  const upper = value.toUpperCase();
  if (nameMap && upper in nameMap) {
    return nameMap[upper];
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }
  return num;
}

export function describeCron(parts: CronParts): string {
  const segments: string[] = [];

  const minuteDesc = describeField(parts.minute, "minute", 0, 59);
  const hourDesc = describeField(parts.hour, "hour", 0, 23);
  const dayOfMonthDesc = describeField(parts.dayOfMonth, "day-of-month", 1, 31);
  const monthDesc = describeField(parts.month, "month", 1, 12);
  const dayOfWeekDesc = describeField(parts.dayOfWeek, "day-of-week", 0, 6);

  if (minuteDesc.isEvery && hourDesc.isEvery && dayOfMonthDesc.isEvery && monthDesc.isEvery && dayOfWeekDesc.isEvery) {
    return "Every minute";
  }

  if (minuteDesc.isEvery) {
    segments.push("Every minute");
  } else if (minuteDesc.isSingle) {
    segments.push(`At minute ${minuteDesc.text}`);
  } else if (minuteDesc.isStep) {
    segments.push(`Every ${minuteDesc.text} minutes`);
  } else {
    segments.push(`At minutes ${minuteDesc.text}`);
  }

  if (!hourDesc.isEvery) {
    if (hourDesc.isSingle) {
      segments.push(`at ${hourDesc.text}:00`);
    } else {
      segments.push(`in hours ${hourDesc.text}`);
    }
  }

  if (!dayOfMonthDesc.isEvery) {
    segments.push(`on day(s) ${dayOfMonthDesc.text} of the month`);
  }

  if (!monthDesc.isEvery) {
    segments.push(`in ${monthDesc.text}`);
  }

  if (!dayOfWeekDesc.isEvery) {
    segments.push(`on ${dayOfWeekDesc.text}`);
  }

  return segments.join(", ");
}

interface FieldDescription {
  text: string;
  isEvery: boolean;
  isSingle: boolean;
  isStep: boolean;
}

function describeField(
  field: CronField,
  fieldType: string,
  min: number,
  max: number
): FieldDescription {
  const isEvery = field.values.length === max - min + 1;
  const isSingle = field.values.length === 1;
  const isStep = field.raw.includes("/") && field.raw.startsWith("*/");

  if (isEvery) {
    return { text: "*", isEvery: true, isSingle: false, isStep: false };
  }

  if (isSingle) {
    const val = field.values[0];
    let text = val.toString();
    if (fieldType === "month") {
      text = getMonthName(val);
    } else if (fieldType === "day-of-week") {
      text = getDayName(val);
    } else if (fieldType === "hour") {
      text = val.toString().padStart(2, "0");
    }
    return { text, isEvery: false, isSingle: true, isStep: false };
  }

  if (isStep) {
    const stepMatch = field.raw.match(/\*\/(\d+)/);
    if (stepMatch) {
      return { text: stepMatch[1], isEvery: false, isSingle: false, isStep: true };
    }
  }

  let text: string;
  if (fieldType === "month") {
    text = field.values.map(getMonthName).join(", ");
  } else if (fieldType === "day-of-week") {
    text = field.values.map(getDayName).join(", ");
  } else {
    text = field.values.join(", ");
  }

  return { text, isEvery: false, isSingle: false, isStep: false };
}

function getMonthName(month: number): string {
  const names = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return names[month] || month.toString();
}

function getDayName(day: number): string {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[day] || day.toString();
}

export function getNextRunTimes(
  parts: CronParts,
  count: number,
  from: Date = new Date()
): Date[] {
  const results: Date[] = [];
  const current = new Date(from);
  current.setUTCSeconds(0, 0);

  const maxIterations = 100000;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    current.setUTCMinutes(current.getUTCMinutes() + 1);

    const minute = current.getUTCMinutes();
    const hour = current.getUTCHours();
    const dayOfMonth = current.getUTCDate();
    const month = current.getUTCMonth() + 1;
    const dayOfWeek = current.getUTCDay();

    if (
      parts.minute.values.includes(minute) &&
      parts.hour.values.includes(hour) &&
      (parts.dayOfMonth.values.includes(dayOfMonth) || parts.dayOfMonth.raw === "*") &&
      parts.month.values.includes(month) &&
      (parts.dayOfWeek.values.includes(dayOfWeek) || parts.dayOfWeek.raw === "*")
    ) {
      results.push(new Date(current));
    }
  }

  if (iterations >= maxIterations) {
    throw new Error("Max iterations reached while computing next run times");
  }

  return results;
}
