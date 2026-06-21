const mongoose = require("mongoose");

/**
 * Each game stores translations for all 3 supported languages
 * so the frontend can fetch /api/games?lang=am and get localized text directly,
 * instead of keeping translations hardcoded in the React file.
 */
const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    am: { type: String, required: true },
    or: { type: String, required: true },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    // stable machine key used by the frontend, e.g. "bingo", "keno"
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    // CSS class fallback gradient, matches game-img-* classes in the frontend
    bgClass: { type: String, required: true },
    // public URL to the card photo (served from /uploads or external CDN)
    imageUrl: { type: String, default: "" },
    // external/internal demo link the "Play Demo" button opens
    demoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 }, // controls display order in the grid
    isActive: { type: Boolean, default: true },
    playCount: { type: Number, default: 0 }, // incremented by /api/games/:key/play
  },
  { timestamps: true }
);

gameSchema.index({ order: 1 });

module.exports = mongoose.model("Game", gameSchema);
