const Game = require("../models/Game");
const DemoClick = require("../models/DemoClick");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Shapes a Game document into the exact format the React frontend's
 * `games` array expects, localized to the requested language.
 */
function toFrontendShape(game, lang = "en") {
  const language = ["en", "am", "or"].includes(lang) ? lang : "en";
  return {
    key: game.key,
    title: game.title[language],
    desc: game.description[language],
    bg: game.bgClass,
    img: game.imageUrl || null,
    demoUrl: game.demoUrl || null,
  };
}

/**
 * GET /api/games?lang=en
 * Public — powers the "Our Games" section. Returns active games, in display order,
 * already localized so the frontend can drop this straight into the `games` array.
 */
const getGames = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "en";

  const games = await Game.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

  res.json({
    success: true,
    data: games.map((g) => toFrontendShape(g, lang)),
  });
});

/**
 * GET /api/games/:key?lang=en
 * Public — single game detail (e.g. for a future dedicated game page).
 */
const getGameByKey = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ key: req.params.key.toLowerCase(), isActive: true });
  if (!game) {
    return res.status(404).json({ success: false, message: "Game not found" });
  }
  res.json({ success: true, data: toFrontendShape(game, req.query.lang) });
});

/**
 * POST /api/games/:key/play
 * Public — called when a user clicks "Play Demo". Increments playCount
 * and logs a DemoClick row for analytics (most popular game, by language, etc.)
 * Body: { language }
 */
const trackDemoPlay = asyncHandler(async (req, res) => {
  const key = req.params.key.toLowerCase();
  const { language } = req.body;

  const game = await Game.findOneAndUpdate(
    { key, isActive: true },
    { $inc: { playCount: 1 } },
    { new: true }
  );

  if (!game) {
    return res.status(404).json({ success: false, message: "Game not found" });
  }

  await DemoClick.create({
    gameKey: key,
    language: ["en", "am", "or"].includes(language) ? language : "en",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.json({
    success: true,
    message: "Demo play tracked",
    data: { key: game.key, playCount: game.playCount, demoUrl: game.demoUrl || null },
  });
});

/* ───────────── ADMIN CRUD ───────────── */

/**
 * POST /api/games  — Admin only. Create a new game.
 * Body: { key, title: {en,am,or}, description: {en,am,or}, bgClass, imageUrl, demoUrl, order }
 */
const createGame = asyncHandler(async (req, res) => {
  const game = await Game.create(req.body);
  res.status(201).json({ success: true, data: game });
});

/**
 * PUT /api/games/:key — Admin only. Update an existing game.
 */
const updateGame = asyncHandler(async (req, res) => {
  const game = await Game.findOneAndUpdate(
    { key: req.params.key.toLowerCase() },
    req.body,
    { new: true, runValidators: true }
  );
  if (!game) {
    return res.status(404).json({ success: false, message: "Game not found" });
  }
  res.json({ success: true, data: game });
});

/**
 * DELETE /api/games/:key — Admin only. Soft-delete (sets isActive: false).
 */
const deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findOneAndUpdate(
    { key: req.params.key.toLowerCase() },
    { isActive: false },
    { new: true }
  );
  if (!game) {
    return res.status(404).json({ success: false, message: "Game not found" });
  }
  res.json({ success: true, message: "Game deactivated" });
});

/**
 * GET /api/games/stats/popular — Admin only. Most-played games.
 */
const getPopularGames = asyncHandler(async (req, res) => {
  const games = await Game.find({ isActive: true })
    .sort({ playCount: -1 })
    .limit(10)
    .select("key title playCount");
  res.json({ success: true, data: games });
});

module.exports = {
  getGames,
  getGameByKey,
  trackDemoPlay,
  createGame,
  updateGame,
  deleteGame,
  getPopularGames,
};
