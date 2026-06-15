import { describe, expect, it } from "vitest";
import {
  parseCronExpression,
  describeCron,
  getNextRunTimes,
} from "./cron-parser.logic";

describe("parseCronExpression", () => {
  it("should parse a simple every-minute expression", () => {
    const parts = parseCronExpression("* * * * *");
    expect(parts.minute.values).toHaveLength(60);
    expect(parts.hour.values).toHaveLength(24);
    expect(parts.dayOfMonth.values).toHaveLength(31);
    expect(parts.month.values).toHaveLength(12);
    expect(parts.dayOfWeek.values).toHaveLength(7);
  });

  it("should parse specific values", () => {
    const parts = parseCronExpression("15 9 1 6 2");
    expect(parts.minute.values).toEqual([15]);
    expect(parts.hour.values).toEqual([9]);
    expect(parts.dayOfMonth.values).toEqual([1]);
    expect(parts.month.values).toEqual([6]);
    expect(parts.dayOfWeek.values).toEqual([2]);
  });

  it("should parse ranges", () => {
    const parts = parseCronExpression("0 9-17 * * 1-5");
    expect(parts.hour.values).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(parts.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
  });

  it("should parse lists", () => {
    const parts = parseCronExpression("0,15,30,45 * * * *");
    expect(parts.minute.values).toEqual([0, 15, 30, 45]);
  });

  it("should parse steps", () => {
    const parts = parseCronExpression("*/15 * * * *");
    expect(parts.minute.values).toEqual([0, 15, 30, 45]);
  });

  it("should parse steps with ranges", () => {
    const parts = parseCronExpression("0-30/10 * * * *");
    expect(parts.minute.values).toEqual([0, 10, 20, 30]);
  });

  it("should parse named months", () => {
    const parts = parseCronExpression("0 0 1 JAN,JUL *");
    expect(parts.month.values).toEqual([1, 7]);
  });

  it("should parse named days", () => {
    const parts = parseCronExpression("0 9 * * MON-FRI");
    expect(parts.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
  });

  it("should throw on invalid field count", () => {
    expect(() => parseCronExpression("* * *")).toThrow("expected 5 fields");
  });

  it("should throw on out-of-range values", () => {
    expect(() => parseCronExpression("60 * * * *")).toThrow("minute value 60 out of range");
  });

  it("should throw on invalid range", () => {
    expect(() => parseCronExpression("10-5 * * * *")).toThrow("Invalid range");
  });
});

describe("describeCron", () => {
  it("should describe every minute", () => {
    const parts = parseCronExpression("* * * * *");
    expect(describeCron(parts)).toBe("Every minute");
  });

  it("should describe a specific schedule", () => {
    const parts = parseCronExpression("30 14 * * *");
    expect(describeCron(parts)).toContain("At minute 30");
    expect(describeCron(parts)).toContain("at 14:00");
  });

  it("should describe every 15 minutes", () => {
    const parts = parseCronExpression("*/15 * * * *");
    expect(describeCron(parts)).toContain("Every 15 minutes");
  });

  it("should describe weekday schedule", () => {
    const parts = parseCronExpression("0 9 * * MON-FRI");
    const description = describeCron(parts);
    expect(description).toContain("At minute 0");
    expect(description).toContain("at 09:00");
    expect(description).toContain("Monday, Tuesday, Wednesday, Thursday, Friday");
  });

  it("should describe monthly schedule", () => {
    const parts = parseCronExpression("0 0 1 * *");
    const description = describeCron(parts);
    expect(description).toContain("At minute 0");
    expect(description).toContain("at 00:00");
    expect(description).toContain("on day(s) 1 of the month");
  });

  it("should describe specific month", () => {
    const parts = parseCronExpression("0 0 1 JAN *");
    const description = describeCron(parts);
    expect(description).toContain("in January");
  });
});

describe("getNextRunTimes", () => {
  it("should compute next runs for every minute", () => {
    const parts = parseCronExpression("* * * * *");
    const from = new Date("2026-06-15T10:00:00Z");
    const runs = getNextRunTimes(parts, 3, from);

    expect(runs).toHaveLength(3);
    expect(runs[0].toISOString()).toBe("2026-06-15T10:01:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-06-15T10:02:00.000Z");
    expect(runs[2].toISOString()).toBe("2026-06-15T10:03:00.000Z");
  });

  it("should compute next runs for hourly schedule", () => {
    const parts = parseCronExpression("0 * * * *");
    const from = new Date("2026-06-15T10:30:00Z");
    const runs = getNextRunTimes(parts, 2, from);

    expect(runs).toHaveLength(2);
    expect(runs[0].toISOString()).toBe("2026-06-15T11:00:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-06-15T12:00:00.000Z");
  });

  it("should compute next runs for daily schedule", () => {
    const parts = parseCronExpression("30 9 * * *");
    const from = new Date("2026-06-15T10:00:00Z");
    const runs = getNextRunTimes(parts, 2, from);

    expect(runs).toHaveLength(2);
    expect(runs[0].toISOString()).toBe("2026-06-16T09:30:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-06-17T09:30:00.000Z");
  });

  it("should compute next runs for weekday schedule", () => {
    const parts = parseCronExpression("0 9 * * 1-5");
    const from = new Date("2026-06-12T10:00:00Z"); // Friday
    const runs = getNextRunTimes(parts, 3, from);

    expect(runs).toHaveLength(3);
    expect(runs[0].getDay()).toBe(1); // Monday
    expect(runs[1].getDay()).toBe(2); // Tuesday
    expect(runs[2].getDay()).toBe(3); // Wednesday
  });

  it("should compute next runs for every 15 minutes", () => {
    const parts = parseCronExpression("*/15 * * * *");
    const from = new Date("2026-06-15T10:07:00Z");
    const runs = getNextRunTimes(parts, 3, from);

    expect(runs).toHaveLength(3);
    expect(runs[0].toISOString()).toBe("2026-06-15T10:15:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-06-15T10:30:00.000Z");
    expect(runs[2].toISOString()).toBe("2026-06-15T10:45:00.000Z");
  });
});
