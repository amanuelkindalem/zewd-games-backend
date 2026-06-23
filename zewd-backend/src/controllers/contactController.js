const { validationResult } = require("express-validator");
const Lead = require("../models/Lead");
const { sendContactNotification } = require("../config/mailer");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/contact
 * Public — called by the "Send Message" button in the contact form.
 * Body: { name, company, email, message, language }
 */
const createLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
  }

  const { name, company, email, message, language } = req.body;

  const lead = await Lead.create({
    name,
    company,
    email,
    message,
    language: ["en", "am", "or"].includes(language) ? language : "en",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Fire-and-forget — don't block the response on email delivery
  sendContactNotification(lead).catch(() => {});

  res.status(201).json({
    success: true,
    message: "Thank you! Your message has been received. We will get back to you shortly.",
    data: { id: lead._id, createdAt: lead.createdAt },
  });
});

/**
 * GET /api/contact
 * Admin only — list all leads, newest first, with optional filtering & pagination.
 * Query: ?status=new&page=1&limit=20
 */
const getLeads = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Lead.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/contact/:id
 * Admin only — single lead detail.
 */
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }
  res.json({ success: true, data: lead });
});

/**
 * PATCH /api/contact/:id/status
 * Admin only — move a lead through the sales pipeline.
 * Body: { status: "contacted" | "qualified" | "closed" | "new" }
 */
const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["new", "contacted", "qualified", "closed"];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${allowed.join(", ")}`,
    });
  }

  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  res.json({ success: true, data: lead });
});

/**
 * DELETE /api/contact/:id
 * Admin only.
 */
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }
  res.json({ success: true, message: "Lead deleted" });
});

module.exports = { createLead, getLeads, getLeadById, updateLeadStatus, deleteLead };
