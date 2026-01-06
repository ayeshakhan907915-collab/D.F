const { spawn } = require("child_process");
const logger = require("./utils/log");

// ===== UPTIME SERVER =====
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  logger(`Server running on port ${PORT}`, "START");
});

// ===== BOT RESTART SYSTEM =====
let restartCount = 0;
const MAX_RESTART = 5;

function startBot(msg) {
  if (msg) logger(msg, "BOT");

  const bot = spawn("node", ["FAIZ-BABU.js"], {
    stdio: "inherit",
    shell: true,
  });

  bot.on("close", (code) => {
    if (code === 0) {
      logger("Bot stopped normally", "BOT");
      process.exit(0);
    }

    restartCount++;
    logger(`Bot crashed | code: ${code}`, "ERROR");

    if (restartCount < MAX_RESTART) {
      setTimeout(() => startBot("Restarting bot..."), 3000);
    } else {
      logger("Max restart limit reached", "STOP");
      process.exit(1);
    }
  });

  bot.on("error", (err) => {
    logger(err.message, "ERROR");
  });
}

startBot("Bot starting...");
