import { TimeResponse, TimeZoneConfig } from "./types";

const TIMEZONES: TimeZoneConfig[] = [
  { city: "toronto", timezone: "America/Toronto" },
  { city: "london",  timezone: "Europe/London" },
  { city: "mumbai",  timezone: "Asia/Kolkata" },
  { city: "tokyo",   timezone: "Asia/Tokyo" },
  { city: "sydney",      timezone: "Australia/Sydney" },
  { city: "los_angeles", timezone: "America/Los_Angeles" },
];

export function formatTimeInZone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function getCurrentTimes(now: Date = new Date()): TimeResponse {
  const times: Record<string, string> = {};

  for (const { city, timezone } of TIMEZONES) {
    times[city] = formatTimeInZone(now, timezone);
  }

  return {
    toronto: times["toronto"],
    london: times["london"],
    mumbai: times["mumbai"],
    tokyo: times["tokyo"],
    sydney: times["sydney"],
    los_angeles: times["los_angeles"],
    generatedAt: now.toISOString(),
  };
}
