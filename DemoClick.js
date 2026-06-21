const mongoose = require("mongoose");

/**
 * One row per "Play Demo" click — lets you see which games get the most interest,
 * broken down by language/locale.
 */
const demoClickSchema = new mongoose.Schema(
  {
    gameKey: { type: String, required: true, index: true },
    language: { type: String, enum: ["en", "am", "or"], default: "en" },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoClick", demoClickSchema);
