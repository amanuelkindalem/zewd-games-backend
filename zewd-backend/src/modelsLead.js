const mongoose = require("mongoose");

/**
 * Matches the contact form fields exactly:
 *   name, company, email, message  (from form state in ZewdGames.jsx)
 * Plus metadata useful for a B2B sales pipeline.
 */
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 5000,
    },
    // which UI language the visitor was using — useful for support follow-up
    language: {
      type: String,
      enum: ["en", "am", "or"],
      default: "en",
    },
    // simple sales pipeline status for the admin to manage leads
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
    source: {
      type: String,
      default: "website_contact_form",
    },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

leadSchema.index({ email: 1, createdAt: -1 });
leadSchema.index({ status: 1 });

module.exports = mongoose.model("Lead", leadSchema);
