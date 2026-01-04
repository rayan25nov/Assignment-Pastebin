import { Request } from "express";

export function getCurrentTime(req: Request): number {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    return parseInt(req.headers["x-test-now-ms"] as string);
  }
  return Date.now();
}

export function isExpired(
  createdAt: number,
  ttlSeconds: number | undefined,
  currentTime: number
): boolean {
  if (!ttlSeconds) return false;
  return currentTime >= createdAt + ttlSeconds * 1000;
}

export function getExpiresAt(
  createdAt: number,
  ttlSeconds: number | undefined
): string | null {
  if (!ttlSeconds) return null;
  return new Date(createdAt + ttlSeconds * 1000).toISOString();
}
