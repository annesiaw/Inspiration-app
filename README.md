# Daily Inspiration — Black Culture, History & Achievement

A mobile app that delivers a daily inspirational quote and cultural lesson rooted in Black history and the African diaspora, powered by Claude AI.

---

## Features

- **Daily Inspiration** — AI-generated quote from a Black luminary with reflection
- **Daily Lesson / Fun Fact** — Culturally rich facts spanning History, Music, Art, Science, Literature, Sports, Culture, and more
- **Push Notifications** — Morning reminder delivered to your phone at 8 AM
- **Share** — Share quotes and facts with friends
- **Pan-African design** — Deep, warm color palette inspired by the Pan-African flag (red, black, green, gold)

---

## Project Structure

```
Inspiration-app/
├── backend/          # Node.js/Express API + scheduler
│   ├── index.js
│   ├── services/
│   │   ├── claude.js           # Claude API content generation
│   │   ├── pushNotifications.js
│   │   └── scheduler.js        # Daily cron job
│   └── routes/
│       ├── content.js
│       └── tokens.js
└── mobile/           # React Native (Expo) app
    ├── App.js
    └── src/
        ├── screens/
        │   ├── HomeScreen.js
        │   └── SettingsScreen.js
        ├── components/
        │   ├── Header.js
        │   ├── InspirationCard.js
        │   └── FactCard.js
        ├── services/
        │   ├── api.js
        │   └── notifications.js
        └── constants/colors.js
```

---

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm start
```

**Environment variables:**
| Variable | Description | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | required |
| `PORT` | Server port | `3000` |
| `NOTIFY_HOUR` | Hour to send daily notifications (24h) | `8` |
| `NOTIFY_MINUTE` | Minute to send daily notifications | `0` |

### Mobile App

```bash
cd mobile
npm install
# Edit app.json → extra.API_URL to point to your backend IP
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) or run on a simulator.

> **Note:** For push notifications to work on a real device, the backend must be reachable from your phone (e.g., same Wi-Fi network or deployed to a server). Update `API_URL` in `mobile/app.json`.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/content` | Get today's AI-generated content |
| `POST` | `/api/tokens` | Register a push notification token |
| `DELETE` | `/api/tokens/:token` | Unregister a token |

---

## Content Coverage

The AI draws from the full breadth of the Black diaspora:

- African kingdoms and history (Mansa Musa, Queen Nzinga, Great Zimbabwe)
- The Harlem Renaissance
- Civil Rights Movement
- Caribbean and Latin American diaspora culture
- Contemporary Black achievement across all fields
- Music (jazz, blues, soul, hip-hop)
- Visual arts, literature, fashion, food, science, sports, politics

---

## Tech Stack

- **Mobile:** React Native + Expo
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude (`claude-sonnet-4-6`)
- **Push Notifications:** Expo Push Notification Service
- **Scheduling:** node-cron
