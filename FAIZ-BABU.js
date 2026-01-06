"use strict";

/* ================= REQUIRE ================= */
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const login = require("priyanshu-fca");
const logger = require("./utils/log");
const { Sequelize, sequelize } = require("./includes/database");

/* ================= GLOBAL CLIENT ================= */
global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  mainPath: process.cwd(),
  configPath: "",
  api: null,
  timeStart: Date.now(),

  getTime(type = "fullTime") {
    const now = moment.tz("Asia/Kolkata");
    const format = {
      seconds: "ss",
      minutes: "mm",
      hours: "HH",
      date: "DD",
      month: "MM",
      year: "YYYY",
      fullHour: "HH:mm:ss",
      fullYear: "DD/MM/YYYY",
      fullTime: "HH:mm:ss DD/MM/YYYY"
    };
    return now.format(format[type] || format.fullTime);
  }
};

/* ================= GLOBAL DATA ================= */
global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: [],
  allUserID: [],
  allThreadID: []
};

global.utils = require("./utils");
global.language = {};
global.config = {};

/* ================= LOAD CONFIG ================= */
try {
  global.client.configPath = path.join(global.client.mainPath, "config.json");
  const cfg = require(global.client.configPath);
  Object.assign(global.config, cfg);
  logger.loader("Config loaded");
} catch (err) {
  logger.loader("config.json not found!", "error");
  process.exit(1);
}

/* ================= LOAD LANGUAGE ================= */
try {
  const langPath = path.join(__dirname, "languages", `${global.config.language || "en"}.lang`);
  const lines = fs.readFileSync(langPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [key, ...value] = line.split("=");
    const [head, sub] = key.split(".");
    if (!global.language[head]) global.language[head] = {};
    global.language[head][sub] = value.join("=").replace(/\\n/g, "\n");
  }
} catch {
  logger.loader("Language file missing!", "warn");
}

global.getText = function (head, key, ...args) {
  try {
    let text = global.language[head][key];
    args.forEach((v, i) => {
      text = text.replace(new RegExp(`%${i + 1}`, "g"), v);
    });
    return text;
  } catch {
    return `[${head}.${key}]`;
  }
};

/* ================= LOAD APPSTATE ================= */
let appState;
try {
  const appPath = path.resolve(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json");
  appState = require(appPath);
  logger.loader("Appstate loaded");
} catch {
  logger.loader("Appstate not found!", "error");
  process.exit(1);
}

/* ================= LOAD MODULES ================= */
function loadModules(folder, map, api, models) {
  const dir = path.join(global.client.mainPath, "models", folder);
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
    try {
      const module = require(path.join(dir, file));
      if (!module.config || !module.run) throw new Error("Invalid module format");
      map.set(module.config.name, module);
      if (module.onLoad) module.onLoad({ api, models });
      logger.loader(`Loaded ${folder}: ${module.config.name}`);
    } catch (err) {
      logger(`Failed to load ${file}: ${err.message}`, "error");
    }
  }
}

/* ================= START BOT ================= */
function startBot(models) {
  login({ appState }, (err, api) => {
    if (err) return logger(JSON.stringify(err), "[ LOGIN ERROR ]");

    api.setOptions(global.config.FCAOption || {});
    global.client.api = api;
    global.client.timeStart = Date.now();

    loadModules("commands", global.client.commands, api, models);
    loadModules("events", global.client.events, api, models);

    logger.loader(
      `Loaded ${global.client.commands.size} commands & ${global.client.events.size} events`
    );

    const listener = require("./includes/listen")({ api, models });

    api.listenMqtt((err, message) => {
      if (err) return logger(err, "[ LISTEN ERROR ]");
      if (["presence", "typ", "read_receipt"].includes(message.type)) return;
      listener(message);
    });

    logger.loader("Bot started successfully");
  });
}

/* ================= DATABASE CONNECT ================= */
(async () => {
  try {
    await sequelize.authenticate();
    const models = require("./includes/database/model")({ Sequelize, sequelize });
    logger.loader("Database connected", "[ DATABASE ]");
    startBot(models);
  } catch (err) {
    logger("Database error: " + err.message, "[ DATABASE ]");
    process.exit(1);
  }
})();

/* ================= SAFETY ================= */
process.on("unhandledRejection", err => {
  logger("Unhandled Promise: " + err, "[ ERROR ]");
});
