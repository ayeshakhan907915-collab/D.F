const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");

// ================= WEBSITE / UPTIME SERVER =================

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  logger(`Server running on port ${PORT}`, "[ STARTING ]");
});

// ================= BOT START & RESTART LOGIC =================

global.countRestart = 0;
const MAX_RESTART = 5;

function startBot(message) {
  if (message) logger(message, "[ BOT ]");

  const child = spawn(
    "node",
    ["--trace-warnings", "--async-stack-traces", "FAIZ-BABU.js"],
    {
      cwd: __dirname,
      stdio: "inherit",
      shell: true
    }
  );

  child.on("close", (code) => {
    if (code !== 0 && global.countRestart < MAX_RESTART) {
      global.countRestart++;
      logger(
        `Bot crashed! Restarting (${global.countRestart}/${MAX_RESTART})`,
        "[ RESTART ]"
      );
      startBot();
    } else if (global.countRestart >= MAX_RESTART) {
      logger("Max restart limit reached. Bot stopped.", "[ STOP ]");
    }
  });

  child.on("error", (err) => {
    logger("Spawn error: " + err.message, "[ ERROR ]");
  });
}

// ================= GITHUB UPDATE CHECK =================

axios
  .get("https://raw.githubusercontent.com/priyanshu192/bot/main/package.json")
  .then((res) => {
    if (!res.data) return;
    logger(res.data.name || "Unknown", "[ NAME ]");
    logger("Version: " + res.data.version, "[ VERSION ]");
    logger(res.data.description || "", "[ DESCRIPTION ]");
  })
  .catch(() => {
    logger("Unable to check updates (offline)", "[ INFO ]");
  });

// ================= START BOT =================

startBot("Starting FAIZ-BABU bot...");
