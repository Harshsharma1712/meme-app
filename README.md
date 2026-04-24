# Meme Hub

A full-stack meme sharing platform where users can create accounts, upload memes, like posts, comment in real time flow, and manage profile avatars.

Meme Hub is built with a modern frontend experience and a scalable API/data layer.

## Tech Stack

- Frontend: Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- Animations: Framer Motion
- Backend: Express.js
- Database: Neon Postgres
- ORM: Drizzle ORM
- Media Storage/CDN: ImageKit
- Auth: JWT (token-based)

## Core Features

- User authentication (register/login)
- Protected routes for authenticated users
- Meme feed with responsive card layout
- Meme upload flow (image + metadata)
- Like/unlike memes
- Comment on memes and delete own comments
- User profile with avatar upload
- Public landing page with product highlights
- Dark, modern UI with motion interactions

## Project Structure

```txt
meme-app/
  client/     # React frontend (Vite)
  server/     # Express API + Drizzle + Neon + ImageKit
```


## Getting Started

### 1) Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- Neon Postgres project
- ImageKit account

### 2) Clone and install dependencies

```bash
git clone https://github.com/Harshsharma1712/meme-app.git
cd meme-app
npm install
cd client && npm install
cd ../server && npm install
```

### 3) Environment Variables

Create environment file .env for backend

``` 
NODE_ENV=development

DATABASE_URL=

PORT = 

JWT_SECRET=

JWT_EXPIRES_IN=

# imagekit env
IMAGEKIT_PUBLIC_KEY=

IMAGEKIT_PRIVATE_KEY=

IMAGEKIT_URL_ENDPOINT=
```

Create enviroment file .env for client
``` 
VITE_API_URL= http://localhost:<PORT>/api
```

### 4) Run in development

From the project root:

```bash
npm run start
```

This runs:
- `server` on its dev command
- `client` on Vite dev server

### 5) Build frontend

```bash
cd client
npm run build
```

## Available Scripts

### Root

- `npm run start` - Run client and server together
- `npm run dev:server` - Run backend only
- `npm run dev:client` - Run frontend only

### Server (`server/`)

- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend in production mode
- `npm run db:generate` - Generate Drizzle SQL artifacts
- `npm run db:migrate` - Run migrations

### Client (`client/`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check + production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## UI/UX Notes

- Monochrome dark visual language
- Glassmorphism card surfaces
- Single accent color for actions and highlights
- Motion-enhanced interactions:
  - Page entrance transitions
  - Hover scale on cards
  - Animated upload border
  - Active navigation underline
  - Skeleton loading states

## Deployment Notes

- Frontend can be deployed on Vercel/Netlify.
- Backend can be deployed on any Node-compatible host.
- Neon provides managed Postgres.
- ImageKit handles media delivery and optimization.
- Ensure CORS origins match deployed frontend URLs.


---

Built for creators, community, and meme culture.
