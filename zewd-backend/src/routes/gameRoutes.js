const express = require("express");
const {
  getGames,
  getGameByKey,
  trackDemoPlay,
  createGame,
  updateGame,
  deleteGame,
  getPopularGames,
} = require("../controllers/gameController");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Public
router.get("/", getGames);                     // GET /api/games?lang=am
router.get("/stats/popular", requireAdmin, getPopularGames); // before /:key so it isn't swallowed
router.get("/:key", getGameByKey);              // GET /api/games/bingo?lang=en
router.post("/:key/play", trackDemoPlay);       // POST /api/games/bingo/play

// Admin
router.post("/", requireAdmin, createGame);
router.put("/:key", requireAdmin, updateGame);
router.delete("/:key", requireAdmin, deleteGame);

module.exports = router;
