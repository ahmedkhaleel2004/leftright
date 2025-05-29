import { NextResponse } from "next/server";

// Cache the star count in memory
let cachedStars: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    // Check if we have a valid cached value
    if (cachedStars && Date.now() - cachedStars.timestamp < CACHE_DURATION) {
      return NextResponse.json({ stars: cachedStars.count });
    }

    // Fetch fresh data from GitHub API
    const response = await fetch(
      "https://api.github.com/repos/ahmedkhaleel2004/leftright",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 }, // Next.js cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub data");
    }

    const data = await response.json();
    const stars = data.stargazers_count || 0;

    // Update the cache
    cachedStars = {
      count: stars,
      timestamp: Date.now(),
    };

    return NextResponse.json({ stars });
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    // Return cached value if available, otherwise 0
    return NextResponse.json({ stars: cachedStars?.count || 0 });
  }
}
