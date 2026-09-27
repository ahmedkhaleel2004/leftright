# left / right

A typing test that times each hand separately. See whether your left or right hand is faster, key by key, and compare with everyone else.

**https://leftrighthand.vercel.app**

## How it works

- Every keystroke is timestamped. A key's speed is the gap since the previous keystroke, counted only when both keys were typed correctly with no backspace in between. Gaps over 1 second count as pauses and are ignored.
- Each letter belongs to the hand that types it in touch typing, for QWERTY, AZERTY, Dvorak, Colemak, Colemak-DH and Workman.
- Your right/left speed ratio goes into a shared histogram per layout (Upstash Redis), so you can see where you sit.

## Development

```bash
bun install
vercel link && vercel env pull   # KV_REST_API_URL / KV_REST_API_TOKEN from the Upstash integration
bun dev
```

Next.js 16, React 19, Tailwind CSS 4, Upstash Redis, Vercel Analytics.

## Cost

Built to run on free tiers: pages are static and revalidate hourly, the community histogram is served from the CDN (Redis is read at most once a minute per layout), and each finished test is one Redis write.
