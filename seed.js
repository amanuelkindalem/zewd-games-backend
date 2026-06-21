/**
 * Run with: npm run seed
 * Populates the Games collection with the exact same 6 games and translations
 * currently hardcoded in the React frontend (ZewdGames.jsx translations object),
 * so /api/games?lang=xx returns identical content.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const Game = require("../models/Game");

const games = [
  {
    key: "bingo",
    title: { en: "Bingo", am: "ቢንጎ", or: "Bingo" },
    description: {
      en: "Classic bingo game with vibrant cards and real-time multiplayer action. Perfect for engaging your players.",
      am: "በቀለማት ያሸበረቁ ካርዶች እና በቅጽበት ባለብዙ ተጫዋቾች ያለው ክላሲክ ቢንጎ ጨዋታ።",
      or: "Taphni bingo klassikaa kaardoota mul'atoo fi taphattoota hedduu yeroo tokkotti taphatamu.",
    },
    bgClass: "game-img-bingo",
    order: 1,
  },
  {
    key: "keno",
    title: { en: "Keno", am: "ኬኖ", or: "Keeno" },
    description: {
      en: "Fast-paced lottery-style game with customizable bet options. Watch the numbers light up as winners are revealed.",
      am: "ሊበጁ በሚችሉ የውርርድ አማራጮች ያለ ፈጣን የሎተሪ ዓይነት ጨዋታ።",
      or: "Taphni lottery-style ariifataa filannoo qabeenya murteessuu danda'amu qaba.",
    },
    bgClass: "game-img-keno",
    order: 2,
  },
  {
    key: "kesh-kesh",
    title: { en: "Kesh Kesh", am: "ኬሽ ኬሽ", or: "Kesh Kesh" },
    description: {
      en: "Unique scratch card experience with instant win mechanics. Multiple themes and prize tiers to keep players engaged.",
      am: "ቅጽበታዊ ሽልማት ያለው ልዩ ስክራች ካርድ ተሞክሮ። የተለያዩ ጭብጦች እና የሽልማት ደረጃዎች።",
      or: "Muuxannoo kaardii scratch addaa yeroo tokkotti mo'annaa qabu. Mata-dureen fi sadarkaalee badhaasaa hedduu.",
    },
    bgClass: "game-img-keash",
    order: 3,
  },
  {
    key: "lottery-draw",
    title: { en: "Lottery Draw", am: "የሎተሪ ዕጣ", or: "Baasii Lottery" },
    description: {
      en: "Traditional lottery game with numbered balls and dramatic reveal animations. Build excitement with every draw.",
      am: "በቁጥር ያሸበረቁ ኳሶች እና አስደናቂ ይፋ አሳይ ያለው ባህላዊ የሎተሪ ጨዋታ።",
      or: "Taphni lottery aadaa lakkoofsa qabuu fi agarsiisa ajaa'ibaa qaba.",
    },
    bgClass: "game-img-lottery",
    order: 4,
  },
  {
    key: "mega-spin",
    title: { en: "Mega Spin", am: "ሜጋ ስፒን", or: "Mega Spin" },
    description: {
      en: "Colorful wheel-of-fortune style game with customizable segments and prizes. High energy entertainment.",
      am: "ሊበጁ በሚችሉ ክፍሎች እና ሽልማቶች ያለ ቀለማት ዊል-ኦፍ-ፎርቹን ዓይነት ጨዋታ።",
      or: "Taphni wheel-of-fortune karooraa fi badhaasaa fooyyessuu danda'amu qaba.",
    },
    bgClass: "game-img-mega",
    order: 5,
  },
  {
    key: "lucky-numbers",
    title: { en: "Lucky Numbers", am: "ዕድለኛ ቁጥሮች", or: "Lakkoofsa Milkii" },
    description: {
      en: "Pick your lucky numbers and watch them match in real-time. Multiple game modes and betting options.",
      am: "ዕድለኛ ቁጥሮቻቸውን ይምረጡ እና በቅጽበት ሲዛመዱ ይከታተሉ።",
      or: "Lakkoofsa milkii kee filadhu yeroo wal simatan hordofi. Haalota taphaa fi filannoo qabeenya hedduu.",
    },
    bgClass: "game-img-lucky",
    order: 6,
  },
];

async function seed() {
  await connectDB();

  console.log("🌱 Seeding games...");

  for (const g of games) {
    await Game.findOneAndUpdate({ key: g.key }, g, { upsert: true, new: true });
    console.log(`   ✓ ${g.key}`);
  }

  console.log("✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
