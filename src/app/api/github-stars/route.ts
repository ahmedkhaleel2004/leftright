import { NextResponse } from "next/server";

// Alternative approach using Next.js Data Cache (uncomment to use):
// import { unstable_cache } from "next/cache";
//
// const getGitHubStars = unstable_cache(
//   async () => {
//     const response = await fetch(
//       "https://api.github.com/repos/ahmedkhaleel2004/leftright",
//       {
//         headers: {
//           Accept: "application/vnd.github.v3+json",
//         },
//       }
//     );
//     const data = await response.json();
//     return data.stargazers_count || 0;
//   },
//   ["github-stars"], // cache key
//   {
//     revalidate: 300, // 5 minutes
//     tags: ["github"], // optional tags for cache invalidation
//   }
// );

export async function GET() {
  try {
    // Fetch data from GitHub API with Next.js caching
    const response = await fetch(
      "https://api.github.com/repos/ahmedkhaleel2004/leftright",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token if available to increase rate limits
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        // This tells Next.js to cache the response for 300 seconds (5 minutes)
        // The cache is shared across all requests and persists between deployments
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const stars = data.stargazers_count || 0;

    return NextResponse.json({ stars });
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    // Return 0 on error, with a shorter cache time
    return NextResponse.json(
      { stars: 0 },
      {
        headers: {
          // Cache error responses for only 1 minute
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate",
        },
      }
    );
  }
}
