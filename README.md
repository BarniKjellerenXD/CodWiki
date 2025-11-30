# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Features

- Guide Viewer: `/guides/ashes-of-the-damned` renders the static HTML guide with glassmorphism styling.
- Image Lightbox: Click images in the guide to zoom, pan, and inspect details.
- Pigpen Cipher Helper: Interactive selector reveals numeric sequences for chosen words.
- Relics / Boss / Perks: Structured color-coded cards for fast mid-run reference.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Troubleshooting Dev Server

If `npm install` fails:
- Delete `node_modules` and lock file then retry `npm install`.
- Ensure Node 18+ (Nuxt 4 requires modern Node). Check with `node -v`.
- If corporate proxy issues arise, configure `npm config set registry https://registry.npmjs.org/`.

