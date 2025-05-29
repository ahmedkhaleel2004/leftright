import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const redis = Redis.fromEnv();

    // Try a simple ping
    await redis.ping();

    // Try to set and get a test value
    await redis.set("test-key", "test-value");
    const value = await redis.get("test-key");

    return NextResponse.json({
      status: "connected",
      testValue: value,
      message: "Redis connection successful!",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to connect to Redis";
    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
        hint: "Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in .env.local",
      },
      { status: 500 }
    );
  }
}
