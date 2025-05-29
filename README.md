# Left-Right Typing Test

A modern typing test app that analyzes your typing speed for each hand separately, helping you understand your typing balance and compare with the community.

## 🎯 Features

- **Hand-specific WPM tracking** - See your words per minute for left and right hands separately
- **Multiple keyboard layouts** - Support for QWERTY, AZERTY, Dvorak, and Colemak
- **Real-time accuracy tracking** - Monitor your typing accuracy as you type
- **Community comparison** - Compare your left/right hand ratio with other users
- **Beautiful UI** - Clean, modern interface built with Tailwind CSS
- **No account required** - Start typing immediately

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ahmedkhaleel2004/leftright.git
cd leftright
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Add your Upstash Redis credentials to `.env.local`:

```
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Upstash Redis](https://upstash.com/) for community statistics
- **Analytics**: [PostHog](https://posthog.com/)
- **Runtime**: [Turbopack](https://turbo.build/pack) for fast development

## 📊 How It Works

1. Choose your keyboard layout
2. Start typing the displayed text
3. The app tracks which hand types each character based on your layout
4. See your WPM for each hand and overall accuracy
5. Compare your left/right hand ratio with the community average

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and not licensed for public use.

---

Built with ❤️ using Next.js and TypeScript
