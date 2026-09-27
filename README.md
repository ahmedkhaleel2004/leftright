<p align="center">
  <a href="https://leftrighthand.vercel.app">
    <img src=".github/banner.png" alt="left / right: which hand types faster?" width="100%" />
  </a>
</p>

<p align="center">
  <b>A typing test that times each hand separately.</b><br />
  Find out whether your left or right hand is faster, key by key, and see where you land against everyone else.
</p>

<p align="center">
  <a href="https://leftrighthand.vercel.app"><b>leftrighthand.vercel.app</b></a>
</p>

<p align="center">
  <img src=".github/demo.gif" alt="Typing a test and getting per-hand results" width="820" />
</p>

## What you get

- **Speed per hand.** Separate wpm for your left and right hand, plus accuracy for each.
- **A key-by-key heatmap.** A split keyboard showing how long you take before every key. Your fastest and slowest keys are called out.
- **Where you stand.** Your right/left ratio is added to a live histogram for your layout, so you can see if you're more lopsided than most.
- **Share cards.** Every result gets its own link with a generated preview image, ready for X.
- **Six layouts.** QWERTY, AZERTY, Dvorak, Colemak, Colemak-DH and Workman, with word or timed tests.
- **Letters colored by hand** as you type, so you can see which hand each word leans on.

## How hand speed is measured

Every keystroke is timestamped. A key's time is the gap since the previous keystroke, and it only counts when:

1. both keys were typed correctly,
2. nothing was deleted in between, and
3. the gap is under a second (longer gaps are pauses, not speed).

Each letter belongs to the hand that types it in standard touch typing for the chosen layout. Hand wpm is `12000 / average gap in ms` (5 characters per word). Spaces are typed with a thumb, so they don't count for either hand.

## Run it locally

```bash
bun install
vercel link && vercel env pull   # Upstash Redis credentials (KV_REST_API_URL, KV_REST_API_TOKEN)
bun dev
```

Only the community histogram needs Redis. Everything else runs without it.

## Stack

[Next.js 16](https://nextjs.org) · React 19 · Tailwind CSS 4 · [Upstash Redis](https://upstash.com) · Vercel Analytics · Bun

Built to cost next to nothing: pages are static and refresh hourly, community stats are served from Vercel's CDN (Redis is read at most once a minute per layout), and a finished test is a single Redis write.
