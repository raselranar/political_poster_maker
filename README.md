# Political Poster Maker

This is a small web app for creating political posters. A user can create an account, choose a poster template, enter their details, upload photos, and download the finished poster.

I built this project while learning full-stack development. The project has two main parts:

- `client/` is the website that runs in the browser.
- `server/` is the API that handles accounts, uploads, poster generation, and database access.

## What I Used

- Next.js, React, and TypeScript for the website
- Express and TypeScript for the API
- MongoDB with Mongoose to save users, templates, and posters
- Cloudinary to store uploaded photos and generated posters
- Groq to choose some visual layout options
- Puppeteer and Google Chrome to render posters as PNG images
- Tailwind CSS and shadcn/ui components for the interface

## What You Need

Before running the app, install:

- Node.js and npm
- MongoDB, either on your computer or through MongoDB Atlas
- A Cloudinary account
- A Groq API key
- Google Chrome installed at `/usr/bin/google-chrome` for the current Puppeteer configuration

The server currently uses this exact Chrome path. If Chrome is installed somewhere else on your computer, update `executablePath` in `server/src/services/poster-renderer.service.ts`.

## Project Setup

Open two terminals from the project folder. Install dependencies in both project parts:

```bash
cd server
npm install
```

In another terminal:

```bash
cd client
npm install
```

### Set Up the Server Environment

Create a file named `server/.env` and add your own values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/political-poster-maker
JWT_SECRET=replace-this-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GROQ_API_KEY=your-groq-api-key
```

For MongoDB Atlas, use the connection string from your Atlas database instead of the local MongoDB URL. Keep real API keys and passwords private. Do not commit your `.env` file.

### Set Up the Client Environment

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This tells the website where to find the API.

## Start the App

In the first terminal, start the API:

```bash
cd server
npm run dev
```

The API normally runs at `http://localhost:5000`.

In the second terminal, start the website:

```bash
cd client
npm run dev
```

Open `http://localhost:3000` in your browser.

## Add the Starter Templates

The app needs templates in MongoDB before the create-poster page can use them. To insert the sample templates, run:

```bash
cd server
npm run seed:templates
```

This script deletes all existing template records before adding the sample templates. Only run it if you are okay with replacing the templates currently in your database.

## How Poster Generation Works

1. The website uploads the selected photos to the API.
2. The API stores the photos in Cloudinary.
3. The API saves the poster details and starts generating the poster.
4. Groq chooses a few layout options. The user's headline and personal details are not written by the AI.
5. Puppeteer opens a local HTML poster in Chrome and takes a PNG screenshot.
6. The API uploads that PNG to Cloudinary and saves its URL in MongoDB.
7. The website checks the poster status and shows the finished image when it is ready.

## Useful Commands

Run these commands from the matching folder:

| Folder | Command | What it does |
| --- | --- | --- |
| `client/` | `npm run dev` | Starts the website in development mode |
| `client/` | `npm run build` | Builds the website for production |
| `client/` | `npm run lint` | Checks the website code with ESLint |
| `server/` | `npm run dev` | Starts the API and watches for changes |
| `server/` | `npm run build` | Compiles the server TypeScript |
| `server/` | `npm run seed:templates` | Replaces the database templates with starter templates |

## Main Folders

```text
client/src/app/          Website pages
client/src/components/   Reusable website components
client/src/lib/api.ts    Functions used by the website to call the API
server/src/controllers/ API request handlers
server/src/models/      MongoDB data models
server/src/routes/      API route definitions
server/src/services/    Poster rendering and external service code
server/src/seeds/       Sample database templates
```

## API Routes

The API starts at `http://localhost:5000` and has these main routes:

- `POST /api/auth/register` creates an account.
- `POST /api/auth/login` logs in.
- `GET /api/templates` returns available templates.
- `POST /api/upload` uploads photos. Sign-in is required.
- `POST /api/posters` starts poster generation. Sign-in is required.
- `GET /api/posters` returns the signed-in user's poster history.
- `GET /api/posters/:id` returns one poster.
- `POST /api/posters/:id/regenerate` regenerates a poster.
- `DELETE /api/posters/:id` deletes a poster.

## Notes for Learning

- Start both the API and website when testing the full app.
- If a poster fails, check the server terminal first. It usually shows the detailed error.
- Check that MongoDB, Cloudinary, Groq, and Chrome are configured before testing generation.
- `server/src/test-renderer.ts` is a small local test for the poster renderer. Run it from `server/` with `npx tsx src/test-renderer.ts`.
