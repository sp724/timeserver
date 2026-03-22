import { getCurrentTimes, formatTimeInZone } from "../timeService";

const FIXED_DATE = new Date("2024-06-15T12:00:00.000Z");

describe("getCurrentTimes", () => {
  it("returns all 4 timezone keys", () => {
    const result = getCurrentTimes(FIXED_DATE);
    expect(result).toHaveProperty("toronto");
    expect(result).toHaveProperty("london");
    expect(result).toHaveProperty("mumbai");
    expect(result).toHaveProperty("tokyo");
  });

  it("sets generatedAt to the input date ISO string", () => {
    const result = getCurrentTimes(FIXED_DATE);
    expect(result.generatedAt).toBe(FIXED_DATE.toISOString());
  });

  it("returns non-empty strings for each city", () => {
    const result = getCurrentTimes(FIXED_DATE);
    expect(result.toronto).toBeTruthy();
    expect(result.london).toBeTruthy();
    expect(result.mumbai).toBeTruthy();
    expect(result.tokyo).toBeTruthy();
  });

  it("returns different time strings for different timezones", () => {
    const result = getCurrentTimes(FIXED_DATE);
    const values = [result.toronto, result.london, result.mumbai, result.tokyo];
    const unique = new Set(values);
    // All 4 timezones are in different UTC offsets for this date
    expect(unique.size).toBe(4);
  });

  it("uses real current time when called with no arguments", () => {
    const before = Date.now();
    const result = getCurrentTimes();
    const after = Date.now();
    const generatedAt = new Date(result.generatedAt).getTime();
    expect(generatedAt).toBeGreaterThanOrEqual(before);
    expect(generatedAt).toBeLessThanOrEqual(after);
  });
});

describe("formatTimeInZone", () => {
  it("formats UTC noon as Toronto time (UTC-4 in June)", () => {
    // 2024-06-15T12:00:00Z → Toronto EDT is UTC-4 → 08:00:00
    const result = formatTimeInZone(FIXED_DATE, "America/Toronto");
    expect(result).toMatch(/2024-06-15/);
    expect(result).toMatch(/08:00:00/);
  });

  it("formats UTC noon as London time (UTC+1 in June)", () => {
    // 2024-06-15T12:00:00Z → London BST is UTC+1 → 13:00:00
    const result = formatTimeInZone(FIXED_DATE, "Europe/London");
    expect(result).toMatch(/2024-06-15/);
    expect(result).toMatch(/13:00:00/);
  });
});
