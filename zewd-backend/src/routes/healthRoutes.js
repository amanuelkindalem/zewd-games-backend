const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const dbStateMap = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    message: "Zewd Games API is running",
    timestamp: new Date().toISOString(),
    database: dbStateMap[mongoose.connection.readyState],
  });
});

module.exports = router;
