const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const { generalLimiter } = require("./middleware/rateLimiters");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/healthRoutes");
const contactRoutes = require("./routes/contactRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

/* ── SECURITY & PARSING ── */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ── CORS — only allow your frontend origins ── */
const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin} is not in CLIENT_URLS`));
    },
    credentials: true,
  })
);

/* ── LOGGING ── */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ── RATE LIMITING (applies to all /api routes) ── */
app.use("/api", generalLimiter);

/* ── ROUTES ── */
app.use("/api/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/games", gameRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the Zewd Games API. See /api/health for status." });
});

/* ── 404 + ERROR HANDLING (must be last) ── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
