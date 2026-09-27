export const REPO_URL = "https://github.com/ahmedkhaleel2004/leftright";

/** Star count, refreshed at most once an hour (ISR), so visits cost nothing. */
export async function getStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/ahmedkhaleel2004/leftright", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}
