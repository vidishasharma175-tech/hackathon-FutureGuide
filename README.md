# FutureGuide

FutureGuide is an AI-driven student guidance backend and demo frontend that helps users discover study streams, find colleges, analyze learning gaps, and match jobs.

This repository contains a Node/Express API and a polished static frontend (public/) for demo and user interaction.

## Quick start (local)

1. Copy environment variables:

   cp .env.example .env

   Fill in any required values in `.env` (database connection string, any LLM/API keys referenced in `src/config/llm.js`).

2. Install dependencies and start the server:

   npm install
   npm run dev

3. Open the app in your browser:

   http://localhost:3000

The Express server serves the frontend from `public/` and exposes API endpoints under `/api/*` (see `/api/docs`). Tool pages are available under `/tools/` and will fall back to static mock data in `public/mock/` if the API or database isn't available.

## Static preview (no backend)

If you just want to preview the frontend without running the Node server or connecting to a database, serve the `public/` folder with a static server:

- With Node (serve):

  npx serve public

- With Python 3:

  cd public && python3 -m http.server 8000

Open the URL shown by the server to inspect the UI and animations. Tool pages will use mock JSON files under `public/mock/`.

## Docker

This repository includes a Dockerfile so you can build and run the app inside a container.

Build the image locally:

  docker build -t futureguide:latest .

Run the container (replace any environment variables or mount a `.env` as needed):

  docker run --env-file .env -p 3000:3000 futureguide:latest

The app will be available at http://localhost:3000.

Notes:
- The Docker image uses `node:18-alpine` and installs production dependencies. If you need dev dependencies inside the container, adjust the Dockerfile.

## CI / CD (GitHub Actions)

A GitHub Actions workflow is included at `.github/workflows/ci.yml`. It:

- Installs dependencies and runs a basic install step.
- (Optional) Runs tests if configured.
- Builds a Docker image and pushes it to GitHub Container Registry (ghcr.io) on pushes to the `main` branch.

To enable Docker image publishing to GitHub Container Registry, no additional secrets are required — the workflow uses the automatically provided `GITHUB_TOKEN`. Make sure your repository's permissions allow `packages: write` from workflows (the workflow requests these permissions).

If you want to push to Docker Hub or another registry, I can update the workflow to use those credentials instead.

## Deployment options

- Quick: Use Docker as shown above and deploy to any host that supports Docker (DigitalOcean, AWS EC2, etc.).
- Container registry + orchestrator: push to GHCR or Docker Hub and deploy to Kubernetes, ECS, or other container platforms.
- Static frontend: the `public/` assets can be hosted on any static CDN (Netlify, Vercel static site, S3+CloudFront). When hosting the frontend separately, set the frontend's API base URL (public/js/*) or enable CORS on the server (already enabled in `src/main.js`).

## Environment variables

See `.env.example`. Typical required values:

- DATABASE_URL or MONGO_URI (used by `src/config/database.js`)
- Any LLM or external API keys used in `src/config/llm.js`
- PORT (optional, default: 3000)

## Running the frontend without a database

Tool pages under `public/tools/` will attempt to call the real API endpoints under `/api/*`. If the API is not reachable they fall back to mock JSON files in `public/mock/` so you can demo UI behavior without a running server.

## Next steps

- Replace placeholder assets in `public/assets/` with your brand logo and hero media.
- Tune animations and build a production process if you want to compile assets (e.g., with a bundler or a React/Tailwind conversion).

If you'd like, I can also add a Docker Compose file, a Helm chart, or a GitHub Pages / Netlify CI config for static hosting of the frontend.
