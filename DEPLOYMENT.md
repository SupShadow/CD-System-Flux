# SYSTEM FLUX - Deployment Guide

## Deployment Options

### Option 1: GitHub Pages (Current)
- **Status:** Active
- **URL:** https://supshadow.github.io/CD-System-Flux/
- **Features:** Static site, no AI/Social API features

The project automatically builds and deploys to GitHub Pages via GitHub Actions.

### Option 2: Vercel (Recommended for Full Features)
- **Status:** Ready to deploy
- **Features:** Full AI features, API routes, image optimization

## Vercel Deployment

### Quick Start

1. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import this GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables:**
   In Vercel Dashboard → Project Settings → Environment Variables:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `ANTHROPIC_API_KEY` | Yes | For AI features (DJ, Transmissions, Companion) |

   Get your API key at: https://console.anthropic.com/

3. **Enable API Routes:**
   Copy API routes from backup:
   ```bash
   cp -r api-routes-backup/api app/api
   ```
   Then commit and push to trigger a new deployment.

4. **Deploy!**
   Vercel automatically deploys on every push to main.

### Environment Detection

The app automatically detects the deployment environment:

| Environment | `NEXT_PUBLIC_DEPLOYMENT` | Features |
|-------------|--------------------------|----------|
| Vercel | `vercel` | Full features + API |
| GitHub Pages | `github` | Static only |
| Local Dev | `local` | All features (needs .env.local) |

### API Routes (Vercel Only)

Located in `api-routes-backup/api/`:

| Route | Purpose |
|-------|---------|
| `/api/recommendations` | AI DJ - Track recommendations |
| `/api/transmissions` | AI-generated narrative text |
| `/api/companion` | AI chat companion |
| `/api/leaderboard` | Infection leaderboard |
| `/api/stats` | Global statistics |
| `/api/sync` | Sync listening sessions |

### Local Development with API

1. Copy `.env.example` to `.env.local`
2. Add your Anthropic API key
3. Copy API routes: `cp -r api-routes-backup/api app/api`
4. Run: `npm run dev`

### Build Commands

```bash
# Development
npm run dev

# Production build (GitHub Pages)
npm run build

# Production build (Vercel) - automatic when deployed
# VERCEL=1 is set automatically by Vercel
```

## Configuration

### next.config.ts

The config automatically switches between:
- **GitHub Pages:** Static export with basePath
- **Vercel:** Full SSR with API routes

### vercel.json

Configures:
- Region: Frankfurt (fra1) for EU users
- Cache headers for audio/artwork files

## Troubleshooting

### API routes not working locally
Make sure you copied them: `cp -r api-routes-backup/api app/api`

### AI features returning fallback data
1. Check that `ANTHROPIC_API_KEY` is set
2. Verify the key at console.anthropic.com
3. Check browser console for errors

### Build fails with "output: export" error
API routes aren't compatible with static export. Either:
- Remove `app/api` folder for GitHub Pages build
- Or deploy to Vercel where API routes work
