import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ layout: string }> }
) {
  try {
    const { layout } = await params;

    // Get the stored data for this layout
    const data = (await redis.get(`ratio:${layout}`)) as {
      count: number;
      sum: number;
      average: number;
    } | null;

    // Return default if no data exists
    if (!data) {
      return NextResponse.json({
        count: 0,
        average: 1.05, // Default to research average
        layout,
      });
    }

    return NextResponse.json({
      count: data.count,
      average: data.average,
      layout,
    });
  } catch (error) {
    console.error("Error fetching ratio:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratio data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ layout: string }> }
) {
  try {
    const { layout } = await params;

    const body = await request.json();

    const { ratio } = body;

    // Validate ratio - reject absurd values
    // Normal range: one hand shouldn't be more than 3x faster than the other
    // or less than 30% as fast
    if (
      typeof ratio !== "number" ||
      !isFinite(ratio) ||
      ratio < 0.3 ||
      ratio > 3.0
    ) {
      return NextResponse.json(
        {
          error: "Invalid ratio value",
          message: "Ratio must be between 0.3 and 3.0",
          receivedRatio: ratio,
        },
        { status: 400 }
      );
    }

    // Get current data
    const current = ((await redis.get(`ratio:${layout}`)) as {
      count: number;
      sum: number;
      average: number;
    } | null) || { count: 0, sum: 0, average: 1.05 };

    // Calculate new average
    const newCount = current.count + 1;
    const newSum = current.sum + ratio;
    const newAverage = newSum / newCount;

    // Store updated data
    await redis.set(`ratio:${layout}`, {
      count: newCount,
      sum: newSum,
      average: newAverage,
    });

    return NextResponse.json({
      count: newCount,
      average: newAverage,
      layout,
    });
  } catch (error) {
    console.error("Error updating ratio:", error);
    return NextResponse.json(
      { error: "Failed to update ratio data" },
      { status: 500 }
    );
  }
}
