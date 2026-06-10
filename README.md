# YVITY Gold

Verified career profile app built with **Next.js** (React) and **Node.js API routes**.

## Stack

- **Frontend:** Next.js 15 App Router, React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js Route Handlers (Node.js) for auth and career profile storage (`.data/profile.json`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Login OTP

1. Go to **Login** and enter your mobile number.
2. Enter the **6-digit code sent on WhatsApp** (requires `WHATSAPP_API_URL` + `WHATSAPP_API_TOKEN` in production).
3. Local dev without WhatsApp keys: set `YVITY_ALLOW_DEMO_OTP=true` and use `123456`.

Changes save to the server and appear on **My Career**.

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Development server   |
| `npm run build` | Production build     |
| `npm start`     | Run production build |
