export interface TimeZoneConfig {
  city: string;
  timezone: string;
}

export const CITY_NAMES = ["toronto", "london", "mumbai", "tokyo", "sydney"] as const;
export type CityName = typeof CITY_NAMES[number];

export interface TimeResponse {
  toronto: string;
  london: string;
  mumbai: string;
  tokyo: string;
  sydney: string;
  generatedAt: string;
}

export interface HealthResponse {
  status: "ok";
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: "ok" | "degraded";
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
