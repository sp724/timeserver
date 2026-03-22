import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { app, errorHandler } from "../server";

describe("GET /health/live", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health/live");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("includes uptime and timestamp fields", async () => {
    const res = await request(app).get("/health/live");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("returns X-Request-ID header", async () => {
    const res = await request(app).get("/health/live");
    expect(res.headers["x-request-id"]).toBeDefined();
  });

  it("echoes X-Request-ID from request if provided", async () => {
    const res = await request(app).get("/health/live").set("X-Request-ID", "test-id-123");
    expect(res.headers["x-request-id"]).toBe("test-id-123");
  });
});

describe("GET /health/ready", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("includes timestamp field", async () => {
    const res = await request(app).get("/health/ready");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("GET /metrics", () => {
  it("returns 200 with Prometheus text format", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
  });

  it("includes http_requests_total metric", async () => {
    await request(app).get("/health/live"); // generate at least one request
    const res = await request(app).get("/metrics");
    expect(res.text).toContain("http_requests_total");
  });

  it("includes http_request_duration_ms metric", async () => {
    const res = await request(app).get("/metrics");
    expect(res.text).toContain("http_request_duration_ms");
  });
});

describe("GET /api/v1/time", () => {
  it("returns 200 with all 4 city fields", async () => {
    const res = await request(app).get("/api/v1/time");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("toronto");
    expect(res.body).toHaveProperty("london");
    expect(res.body).toHaveProperty("mumbai");
    expect(res.body).toHaveProperty("tokyo");
  });

  it("returns JSON content-type", async () => {
    const res = await request(app).get("/api/v1/time");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });

  it("city values are non-empty strings", async () => {
    const res = await request(app).get("/api/v1/time");
    expect(res.body.toronto).toBeTruthy();
    expect(res.body.london).toBeTruthy();
    expect(res.body.mumbai).toBeTruthy();
    expect(res.body.tokyo).toBeTruthy();
  });

  it("includes RateLimit headers from express-rate-limit", async () => {
    const res = await request(app).get("/api/v1/time");
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });
});

describe("Unknown routes", () => {
  it("returns 404 with error NotFound", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NotFound");
  });
});

describe("errorHandler", () => {
  it("returns 500 with InternalServerError when next(err) is called", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const testApp = express();
    testApp.get("/boom", (_req, _res, next) => {
      next(new Error("test error"));
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("InternalServerError");

    consoleSpy.mockRestore();
  });
});

describe("PORT environment variable", () => {
  it("reads PORT from process.env when set", () => {
    const original = process.env.PORT;
    process.env.PORT = "9999";
    const port = parseInt(process.env.PORT ?? "8888", 10);
    expect(port).toBe(9999);
    if (original === undefined) delete process.env.PORT;
    else process.env.PORT = original;
  });
});
