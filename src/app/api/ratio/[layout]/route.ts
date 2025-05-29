import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET(
  request: Request,
  { params }: { params: { layout: string } }
) {
  try {
    const { layout } = params;

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
  { params }: { params: { layout: string } }
) {
  try {
    const { layout } = params;
    console.log("POST /api/ratio/[layout] - Layout:", layout);

    const body = await request.json();
    console.log("Request body:", body);

    const { ratio } = body;

    // Validate ratio
    if (typeof ratio !== "number" || ratio <= 0 || ratio > 10) {
      console.log("Invalid ratio:", ratio);
      return NextResponse.json(
        { error: "Invalid ratio value" },
        { status: 400 }
      );
    }

    // Get current data
    console.log("Fetching current data for key:", `ratio:${layout}`);
    const current = ((await redis.get(`ratio:${layout}`)) as {
      count: number;
      sum: number;
      average: number;
    } | null) || { count: 0, sum: 0, average: 1.05 };

    console.log("Current data:", current);

    // Calculate new average
    const newCount = current.count + 1;
    const newSum = current.sum + ratio;
    const newAverage = newSum / newCount;

    console.log(
      "New values - Count:",
      newCount,
      "Sum:",
      newSum,
      "Average:",
      newAverage
    );

    // Store updated data
    await redis.set(`ratio:${layout}`, {
      count: newCount,
      sum: newSum,
      average: newAverage,
    });

    console.log("Data stored successfully");

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
