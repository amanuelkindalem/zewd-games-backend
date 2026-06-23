# Zewd Games — Backend API

Node.js + Express + MongoDB backend for the Zewd Games B2B gaming website.
Built to plug directly into the existing React frontend (`ZewdGames.jsx`) with **zero changes to its UI/UX or styling**.

---

## Features

- **Contact form API** — receives Name / Company / Email / Message from the "Get In Touch" form, stores it in MongoDB, and emails you a notification.
- **Games catalog API** — serves the 6 games (Bingo, Keno, Kesh Kesh, Lottery Draw, Mega Spin, Lucky Numbers) fully localized in English, Amharic, and Afan Oromo — so game text can be edited from the database instead of hardcoded in React.
- **Demo click tracking** — every "Play Demo" click is logged, with a play counter per game and a `/stats/popular` endpoint to see what's working.
- **Admin endpoints** — list/filter/update/delete leads, manage games — protected by a simple API key.
- **Production-ready middleware** — Helmet (security headers), CORS allow-list, rate limiting (general + strict on the contact form), input validation, centralized error handling, gzip compression, request logging.

---

## 1. Install

```bash
cd zewd-backend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | What it is |
|---|---|
| `MONGO_URI` | Your MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier) |
| `CLIENT_URLS` | Your React app's URL(s), comma-separated (e.g. your CodeSandbox preview URL) |
| `SMTP_HOST/PORT/USER/PASS` | For email notifications on new leads. Gmail example: use an [App Password](https://myaccount.google.com/apppasswords) |
| `NOTIFY_EMAIL` | Where lead notification emails are sent |
| `ADMIN_API_KEY` | A long random string — required in the `x-admin-key` header to access admin routes |

> **No MongoDB yet?** Easiest path: create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), click "Connect → Drivers", copy the connection string into `MONGO_URI`.

## 3. Seed the games

This populates the database with the 6 games and their English/Amharic/Afan Oromo translations:

```bash
npm run seed
```

## 4. Run the server

```bash
npm run dev      # development, auto-restarts on file changes
npm start        # production
```

Server starts on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Contact / Leads

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/contact` | Public | Submit the contact form |
| `GET` | `/contact` | Admin | List leads (`?status=new&page=1&limit=20`) |
| `GET` | `/contact/:id` | Admin | Get one lead |
| `PATCH` | `/contact/:id/status` | Admin | Update pipeline status |
| `DELETE` | `/contact/:id` | Admin | Delete a lead |

**`POST /api/contact`** — body:
```json
{
  "name": "Abebe Kebede",
  "company": "Awash Bank",
  "email": "abebe@awashbank.com",
  "message": "Interested in integrating Bingo and Keno.",
  "language": "am"
}
```
Response `201`:
```json
{
  "success": true,
  "message": "Thank you! Your message has been received. We will get back to you shortly.",
  "data": { "id": "665f...", "createdAt": "2026-06-21T10:00:00.000Z" }
}
```

### Games

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/games?lang=en` | Public | List all active games, localized |
| `GET` | `/games/:key?lang=am` | Public | Get one game |
| `POST` | `/games/:key/play` | Public | Track a "Play Demo" click |
| `GET` | `/games/stats/popular` | Admin | Most-played games |
| `POST` | `/games` | Admin | Create a game |
| `PUT` | `/games/:key` | Admin | Update a game |
| `DELETE` | `/games/:key` | Admin | Deactivate a game |

**`GET /api/games?lang=am`** — response shape matches the frontend's `games` array exactly:
```json
{
  "success": true,
  "data": [
    { "key": "bingo", "title": "ቢንጎ", "desc": "...", "bg": "game-img-bingo", "img": null, "demoUrl": null },
    ...
  ]
}
```

**`POST /api/games/bingo/play`** — body:
```json
{ "language": "en" }
```

### Admin auth

Add this header to any admin route:
```
x-admin-key: <your ADMIN_API_KEY from .env>
```

---

## Connecting the React frontend

In `ZewdGames.jsx`, replace the contact form's `handleSubmit` with a real API call:

```js
const API_URL = "http://localhost:5000/api"; // or your deployed backend URL

const handleSubmit = async () => {
  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, language: lang }),
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      setForm({ name: "", company: "", email: "", message: "" });
    } else {
      alert(data.message || "Something went wrong. Please try again.");
    }
  } catch (err) {
    alert("Could not reach the server. Please check your connection.");
  }
};
```

To track demo clicks, update the `btn-demo` button in `GameCard`:
```js
onClick={() => fetch(`${API_URL}/games/${g.key}/play`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ language: lang }),
})}
```

To pull games from the database instead of the hardcoded array:
```js
const [games, setGames] = useState([]);

useEffect(() => {
  fetch(`${API_URL}/games?lang=${lang}`)
    .then(res => res.json())
    .then(data => { if (data.success) setGames(data.data); });
}, [lang]);
```

---

## Project structure

```
zewd-backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── mailer.js      # Nodemailer setup + notification template
│   ├── controllers/
│   │   ├── contactController.js
│   │   └── gameController.js
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiters.js
│   │   └── requireAdmin.js
│   ├── models/
│   │   ├── Lead.js
│   │   ├── Game.js
│   │   └── DemoClick.js
│   ├── routes/
│   │   ├── contactRoutes.js
│   │   ├── gameRoutes.js
│   │   └── healthRoutes.js
│   ├── utils/
│   │   └── seed.js        # npm run seed
│   ├── app.js              # Express app + middleware stack
│   └── server.js           # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Deployment notes

- Works on any Node host: **Render**, **Railway**, **Fly.io**, **Heroku**, or a VPS.
- Set all `.env` variables in your host's environment variable settings (never commit `.env`).
- Update `CLIENT_URLS` to your deployed frontend's real URL once it's live.
- Use MongoDB Atlas in production rather than a local MongoDB instance.
