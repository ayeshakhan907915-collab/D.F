"use strict";

const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const login = require("priyanshu-fca");
const logger = require("./utils/log");
const axios = require("axios");

const listPackage = require("./package.json").dependencies || {};
const builtinModules = require("module").builtinModules;

// ================= GLOBAL OBJECTS =================

global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime(type) {
    const now = moment.tz("Asia/Kolkata");
    const map = {
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
    return now.format(map[type] || map.fullTime);
  }
};

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
global.nodemodule = {};
global.config = {};
global.configModule = {};
global.language = {};

// ================= LOAD CONFIG =================

try {
  global.client.configPath = path.join(global.client.mainPath, "config.json");
  const cfg = require(global.client.configPath);
  Object.assign(global.config, cfg);
  fs.writeFileSync(global.client.configPath + ".temp", JSON.stringify(cfg, null, 4));
  logger.loader("Config loaded");
} catch (e) {
  return logger.loader("config.json not found!", "error");
}

// ================= LOAD LANGUAGE =================

try {
  const langPath = path.join(__dirname, "languages", `${global.config.language || "en"}.lang`);
  const data = fs.readFileSync(langPath, "utf8")
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith("#"));

  for (const line of data) {
    const [key, ...rest] = line.split("=");
    const [head, sub] = key.split(".");
    if (!global.language[head]) global.language[head] = {};
    global.language[head][sub] = rest.join("=").replace(/\\n/g, "\n");
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

// ================= LOAD APPSTATE =================

let appState;
try {
  const appPath = path.resolve(global.client.mainPath, global.config.APPSTATEPATH);
  appState = require(appPath);
  logger.loader("Appstate loaded");
} catch {
  return logger.loader("Appstate not found!", "error");
}

// ================= DATABASE =================

const { Sequelize, sequelize } = require("./includes/database");

(async () => {
  try {
    await sequelize.authenticate();
    const models = require("./includes/database/model")({ Sequelize, sequelize });
    logger.loader("Database connected", "[ DATABASE ]");
    startBot(models);
  } catch (e) {
    logger("Database error: " + e.message, "[ DATABASE ]");
  }
})();

// ================= BOT START =================

function startBot(models) {
  login({ appState }, (err, api) => {
    if (err) return logger(JSON.stringify(err), "[ LOGIN ERROR ]");

    api.setOptions(global.config.FCAOption);
    global.client.api = api;
    global.client.timeStart = Date.now();

    loadModules("commands", global.client.commands, api, models);
    loadModules("events", global.client.events, api, models);

    logger.loader(
      `Loaded ${global.client.commands.size} commands & ${global.client.events.size} events`
    );

    fs.writeFileSync(
      global.client.configPath,
      JSON.stringify(global.config, null, 4)
    );
    fs.removeSync(global.client.configPath + ".temp");

    const listener = require("./includes/listen")({ api, models });

    api.listenMqtt((err, message) => {
      if (err) return logger(err, "[ LISTEN ERROR ]");
      if (["presence", "typ", "read_receipt"].includes(message.type)) return;
      listener(message);
    });
  });
}

// ================= MODULE LOADER =================

function loadModules(folder, map, api, models) {
  const dir = path.join(global.client.mainPath, "models", folder);
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
    try {
      const module = require(path.join(dir, file));
      if (!module.config || !module.run) throw "Invalid module format";

      map.set(module.config.name, module);

      if (module.onLoad) module.onLoad({ api, models });
      logger.loader(`Loaded ${folder}: ${module.config.name}`);
    } catch (e) {
      logger(`Failed ${folder} ${file}: ${e}`, "error");
    }
  }
}

// ================= GLOBAL SAFETY =================

process.on("unhandledRejection", err => {
  logger("Unhandled Promise: " + err, "[ ERROR ]");
});            case "fullYear":
                return `${moment.tz("Asia/Kolkata").format("DD/MM/YYYY")}`;
            case "fullTime":
                return `${moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY")}`;
        }
  }
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");

global.nodemodule = new Object();

global.config = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
    logger.loader("Found file config: config.json");
}
catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
    }
    else return logger.loader("config.json not found!", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Loaded!");
}
catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./includes/database");

writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;    
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
}

try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
    logger.loader(global.getText("priyansh", "foundPathAppstate"))
}
catch { return logger.loader(global.getText("priyansh", "notFoundPathAppstate"), "error") }

//========= Login account and start Listen Event =========//

function onBot({ models: botModel }) {
    const loginData = {};
    loginData['appState'] = appState;
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
        loginApiData.setOptions(global.config.FCAOption)
        writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09'))
        global.client.api = loginApiData
        global.config.version = '1.2.14'
        global.client.timeStart = new Date().getTime(),
            function () {
                const listCommand = readdirSync(global.client.mainPath + '/models/commands').filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));
                for (const command of listCommand) {
                    try {
                        var module = require(global.client.mainPath + '/models/commands/' + command);
                        if (!module.config || !module.run || !module.config.commandCategory) throw new Error(global.getText('priyansh', 'errorFormat'));
                        if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('priyansh', 'nameExist'));
                        if (!module.languages || typeof module.languages != 'object' || Object.keys(module.languages).length == 0) logger.loader(global.getText('priyansh', 'notFoundLanguage', module.config.name), 'warn');
                        if (module.config.dependencies && typeof module.config.dependencies == 'object') {
                            for (const reqDependencies in module.config.dependencies) {
                                const reqDependenciesPath = join(__dirname, 'nodemodules', 'node_modules', reqDependencies);
                                try {
                                    if (!global.nodemodule.hasOwnProperty(reqDependencies)) {
                                        if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global.nodemodule[reqDependencies] = require(reqDependencies);
                                        else global.nodemodule[reqDependencies] = require(reqDependenciesPath);
                                    } else '';
                                } catch {
                                    var check = false;
                                    var isError;
                                    logger.loader(global.getText('priyansh', 'notFoundPackage', reqDependencies, module.config.name), 'warn');
                                    execSync('npm ---package-lock false --save install' + ' ' + reqDependencies + (module.config.dependencies[reqDependencies] == '*' || module.config.dependencies[reqDependencies] == '' ? '' : '@' + module.config.dependencies[reqDependencies]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                                    for (let i = 1; i <= 3; i++) {
                                        try {
                                            require['cache'] = {};
                                            if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global['nodemodule'][reqDependencies] = require(reqDependencies);
                                            else global['nodemodule'][reqDependencies] = require(reqDependenciesPath);
                                            check = true;
                                            break;
                                        } catch (error) { isError = error; }
                                        if (check || !isError) break;
                                    }
                                    if (!check || isError) throw global.getText('priyansh', 'cantInstallPackage', reqDependencies, module.config.name, isError);
                                }
                            }
                            logger.loader(global.getText('priyansh', 'loadedPackage', module.config.name));
                        }
                        if (module.config.envConfig) try {
                            for (const envConfig in module.config.envConfig) {
                                if (typeof global.configModule[module.config.name] == 'undefined') global.configModule[module.config.name] = {};
                                if (typeof global.config[module.config.name] == 'undefined') global.config[module.config.name] = {};
                                if (typeof global.config[module.config.name][envConfig] !== 'undefined') global['configModule'][module.config.name][envConfig] = global.config[module.config.name][envConfig];
                                else global.configModule[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                                if (typeof global.config[module.config.name][envConfig] == 'undefined') global.config[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                            }
                            logger.loader(global.getText('priyansh', 'loadedConfig', module.config.name));
                        } catch (error) {
                            throw new Error(global.getText('priyansh', 'loadedConfig', module.config.name, JSON.stringify(error)));
                        }
                        if (module.onLoad) {
                            try {
                                const moduleData = {};
                                moduleData.api = loginApiData;
                                moduleData.models = botModel;
                                module.onLoad(moduleData);
                            } catch (_0x20fd5f) {
                                throw new Error(global.getText('priyansh', 'cantOnload', module.config.name, JSON.stringify(_0x20fd5f)), 'error');
                            };
                        }
                        if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
                        global.client.commands.set(module.config.name, module);
                        logger.loader(global.getText('priyansh', 'successLoadModule', module.config.name));
                    } catch (error) {
                        logger.loader(global.getText('priyansh', 'failLoadModule', module.config.name, error), 'error');
                    };
                }
            }(),
            function() {
                const events = readdirSync(global.client.mainPath + '/models/events').filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));
                for (const ev of events) {
                    try {
                        var event = require(global.client.mainPath + '/models/events/' + ev);
                        if (!event.config || !event.run) throw new Error(global.getText('priyansh', 'errorFormat'));
                        if (global.client.events.has(event.config.name) || '') throw new Error(global.getText('priyansh', 'nameExist'));
                        if (event.config.dependencies && typeof event.config.dependencies == 'object') {
                            for (const dependency in event.config.dependencies) {
                                const _0x21abed = join(__dirname, 'nodemodules', 'node_modules', dependency);
                                try {
                                    if (!global.nodemodule.hasOwnProperty(dependency)) {
                                        if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) global.nodemodule[dependency] = require(dependency);
                                        else global.nodemodule[dependency] = require(_0x21abed);
                                    } else '';
                                } catch {
                                    let check = false;
                                    let isError;
                                    logger.loader(global.getText('priyansh', 'notFoundPackage', dependency, event.config.name), 'warn');
                                    execSync('npm --package-lock false --save install' + dependency + (event.config.dependencies[dependency] == '*' || event.config.dependencies[dependency] == '' ? '' : '@' + event.config.dependencies[dependency]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                                    for (let i = 1; i <= 3; i++) {
                                        try {
                                            require['cache'] = {};
                                            if (global.nodemodule.includes(dependency)) break;
                                            if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) global.nodemodule[dependency] = require(dependency);
                                            else global.nodemodule[dependency] = require(_0x21abed);
                                            check = true;
                                            break;
                                        } catch (error) { isError = error; }
                                        if (check || !isError) break;
                                    }
                                    if (!check || isError) throw global.getText('priyansh', 'cantInstallPackage', dependency, event.config.name);
                                }
                            }
                            logger.loader(global.getText('priyansh', 'loadedPackage', event.config.name));
                        }
                        if (event.config.envConfig) try {
                            for (const _0x5beea0 in event.config.envConfig) {
                                if (typeof global.configModule[event.config.name] == 'undefined') global.configModule[event.config.name] = {};
                                if (typeof global.config[event.config.name] == 'undefined') global.config[event.config.name] = {};
                                if (typeof global.config[event.config.name][_0x5beea0] !== 'undefined') global.configModule[event.config.name][_0x5beea0] = global.config[event.config.name][_0x5beea0];
                                else global.configModule[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                                if (typeof global.config[event.config.name][_0x5beea0] == 'undefined') global.config[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                            }
                            logger.loader(global.getText('priyansh', 'loadedConfig', event.config.name));
                        } catch (error) {
                            throw new Error(global.getText('priyansh', 'loadedConfig', event.config.name, JSON.stringify(error)));
                        }
                        if (event.onLoad) try {
                            const eventData = {};
                            eventData.api = loginApiData, eventData.models = botModel;
                            event.onLoad(eventData);
                        } catch (error) {
                            throw new Error(global.getText('priyansh', 'cantOnload', event.config.name, JSON.stringify(error)), 'error');
                        }
                        global.client.events.set(event.config.name, event);
                        logger.loader(global.getText('priyansh', 'successLoadModule', event.config.name));
                    } catch (error) {
                        logger.loader(global.getText('priyansh', 'failLoadModule', event.config.name, error), 'error');
                    }
                }
            }()
        logger.loader(global.getText('priyansh', 'finishLoadModule', global.client.commands.size, global.client.events.size)) 
        logger.loader(`Startup Time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`)   
        logger.loader('===== [ ' + (Date.now() - global.client.timeStart) + 'ms ] =====')
        writeFileSync(global.client['configPath'], JSON['stringify'](global.config, null, 4), 'utf8') 
        unlinkSync(global['client']['configPath'] + '.temp');        
        const listenerData = {};
        listenerData.api = loginApiData; 
        listenerData.models = botModel;
        const listener = require('./includes/listen')(listenerData);

        function listenerCallback(error, message) {
            if (error) return logger(global.getText('priyansh', 'handleListenError', JSON.stringify(error)), 'error');
            if (['presence', 'typ', 'read_receipt'].some(data => data == message.type)) return;
            if (global.config.DeveloperMode == !![]) console.log(message);
            return listener(message);
        };
        global.handleListen = loginApiData.listenMqtt(listenerCallback);
        try {
            await checkBan(loginApiData);
        } catch (error) {
            return //process.exit(0);
        };
        if (!global.checkBan) logger(global.getText('priyansh', 'warningSourceCode'), '[ GLOBAL BAN ]');
    });
}

//========= Connecting to Database =========//

(async () => {
    try {
        await sequelize.authenticate();
        const authentication = {};
        authentication.Sequelize = Sequelize;
        authentication.sequelize = sequelize;
        const models = require('./includes/database/model')(authentication);
        logger(global.getText('priyansh', 'successConnectDatabase'), '[ DATABASE ]');
        const botData = {};
        botData.models = models
        onBot(botData);
    } catch (error) { logger(global.getText('priyansh', 'successConnectDatabase', JSON.stringify(error)), '[ DATABASE ]'); }
})();

process.on('unhandledRejection', (err, p) => {});
