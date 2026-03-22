export interface TimeZoneConfig {
  city: string;
  timezone: string;
}

export interface TimeResponse {
  toronto: string;
  london: string;
  mumbai: string;
  tokyo: string;
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
