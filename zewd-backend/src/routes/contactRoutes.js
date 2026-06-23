const express = require("express");
const { body } = require("express-validator");
const {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
} = require("../controllers/contactController");
const requireAdmin = require("../middleware/requireAdmin");
const { contactLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Validation rules matching the frontend form fields exactly
const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("company").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
  body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 5000 }),
  body("language").optional().isIn(["en", "am", "or"]),
];

// Public
router.post("/", contactLimiter, contactValidation, createLead);

// Admin
router.get("/", requireAdmin, getLeads);
router.get("/:id", requireAdmin, getLeadById);
router.patch("/:id/status", requireAdmin, updateLeadStatus);
router.delete("/:id", requireAdmin, deleteLead);

module.exports = router;
