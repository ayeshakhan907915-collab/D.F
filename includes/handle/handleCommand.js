module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity");
  const logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return async function ({ event }) {
    if (!event || !event.body) return;

    const dateNow = Date.now();
    const time = moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY");

    const {
      PREFIX,
      ADMINBOT,
      NDH,
      DeveloperMode
    } = global.config;

    const {
      userBanned,
      threadBanned,
      threadInfo,
      threadData,
      commandBanned
    } = global.data;

    const { commands, cooldowns } = global.client;

    let { body, senderID, threadID, messageID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    /* ===== PREFIX CHECK ===== */
    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.PREFIX || PREFIX;

    const prefixRegex = new RegExp(
      `^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`
    );
    if (!prefixRegex.test(body)) return;

    /* ===== BAN CHECK ===== */
    if (!ADMINBOT.includes(senderID)) {
      if (userBanned.has(senderID)) {
        const { reason, dateAdded } = userBanned.get(senderID) || {};
        return api.sendMessage(
          global.getText("handleCommand", "userBanned", reason, dateAdded),
          threadID,
          messageID
        );
      }

      if (threadBanned.has(threadID)) {
        const { reason, dateAdded } = threadBanned.get(threadID) || {};
        return api.sendMessage(
          global.getText("handleCommand", "threadBanned", reason, dateAdded),
          threadID,
          messageID
        );
      }
    }

    /* ===== PARSE COMMAND ===== */
    const [matchedPrefix] = body.match(prefixRegex);
    const args = body.slice(matchedPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    let command = commands.get(commandName);

    if (!command) {
      const listCmd = [...commands.keys()];
      const checker = stringSimilarity.findBestMatch(commandName, listCmd);
      if (checker.bestMatch.rating >= 0.5)
        command = commands.get(checker.bestMatch.target);
      else
        return api.sendMessage(
          global.getText("handleCommand", "commandNotExist"),
          threadID,
          messageID
        );
    }

    /* ===== COMMAND BAN ===== */
    if (!ADMINBOT.includes(senderID)) {
      const banT = commandBanned.get(threadID) || [];
      const banU = commandBanned.get(senderID) || [];

      if (banT.includes(command.config.name))
        return api.sendMessage(
          global.getText(
            "handleCommand",
            "commandThreadBanned",
            command.config.name
          ),
          threadID,
          messageID
        );

      if (banU.includes(command.config.name))
        return api.sendMessage(
          global.getText(
            "handleCommand",
            "commandUserBanned",
            command.config.name
          ),
          threadID,
          messageID
        );
    }

    /* ===== PERMISSION ===== */
    let permssion = 0;
    const info =
      threadInfo.get(threadID) || (await Threads.getInfo(threadID));
    const isAdmin = info?.adminIDs?.some(e => e.id == senderID);

    if (NDH.includes(senderID)) permssion = 2;
    if (ADMINBOT.includes(senderID)) permssion = 3;
    else if (isAdmin) permssion = 1;

    if (command.config.hasPermssion > permssion)
      return api.sendMessage(
        global.getText("handleCommand", "permssionNotEnough"),
        threadID,
        messageID
      );

    /* ===== COOLDOWN ===== */
    if (!cooldowns.has(command.config.name))
      cooldowns.set(command.config.name, new Map());

    const timestamps = cooldowns.get(command.config.name);
    const cooldownTime = (command.config.cooldowns || 1) * 1000;

    if (
      timestamps.has(senderID) &&
      dateNow < timestamps.get(senderID) + cooldownTime
    ) {
      const left =
        (timestamps.get(senderID) + cooldownTime - dateNow) / 1000;
      return api.sendMessage(
        `⏳ Wait ${left.toFixed(1)}s before using this command again`,
        threadID,
        messageID
      );
    }

    /* ===== LANGUAGE ===== */
    let getText2 = () => "";
    if (command.languages?.[global.config.language]) {
      getText2 = (...v) => {
        let txt =
          command.languages[global.config.language][v[0]] || "";
        v.forEach((x, i) => {
          txt = txt.replace(new RegExp(`%${i}`, "g"), x);
        });
        return txt;
      };
    }

    /* ===== RUN ===== */
    try {
      await command.run({
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion,
        getText: getText2
      });

      timestamps.set(senderID, dateNow);

      if (DeveloperMode === true) {
        logger(
          global.getText(
            "handleCommand",
            "executeCommand",
            time,
            commandName,
            senderID,
            threadID,
            args.join(" "),
            Date.now() - dateNow
          )
        );
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(
        global.getText("handleCommand", "commandError", commandName, err),
        threadID,
        messageID
      );
    }
  };
};          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            return api.unsendMessage(info.messageID);
          }, messageID);
        } else {
          if (threadBanned.has(threadID)) {
            const { reason, dateAdded } = threadBanned.get(threadID) || {};
            return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
              await new Promise(resolve => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            }, messageID);
          }
        }
      }
    }
    const [matchedPrefix] = body.match(prefixRegex),
      args = body.slice(matchedPrefix.length).trim().split(/ +/);
    commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);
    if (!command) {
      var allCommandName = [];
      const commandValues = commands['keys']();
      for (const cmd of commandValues) allCommandName.push(cmd)
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.5) command = client.commands.get(checker.bestMatch.target);
      else return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID);
    }
    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [],
          banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000))
            return api.unsendMessage(info.messageID);
          }, messageID);
        if (banUsers.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            return api.unsendMessage(info.messageID);
          }, messageID);
      }
    }
    if (command.config.commandCategory.toLowerCase() == 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
      return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {

        await new Promise(resolve => setTimeout(resolve, 5 * 1000))
        return api.unsendMessage(info.messageID);
      }, messageID);
    var threadInfo2;
    if (event.isGroup == !![])
      try {
        threadInfo2 = (threadInfo.get(threadID) || await Threads.getInfo(threadID))
        if (Object.keys(threadInfo2).length == 0) throw new Error();
      } catch (err) {
        logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
      }
    var permssion = 0;
    var threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const find = threadInfoo.adminIDs.find(el => el.id == senderID);
    if (NDH.includes(senderID.toString())) permssion = 2;
    if (ADMINBOT.includes(senderID.toString())) permssion = 3;
    else if (!ADMINBOT.includes(senderID) && !NDH.includes(senderID) && find) permssion = 1;
    if (command.config.hasPermssion > permssion) return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), event.threadID, event.messageID);
     
       if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
        const timestamps = client.cooldowns.get(command.config.name);;
        const expirationTime = (command.config.cooldowns || 1) * 1000;
        if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) 
      return api.sendMessage(`You just used this command and\ntry again later ${((timestamps.get(senderID) + expirationTime - dateNow)/1000).toString().slice(0, 5)} In another second, use the order again slowly`, threadID, messageID);

    var getText2;
    if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language))
      getText2 = (...values) => {
        var lang = command.languages[global.config.language][values[0]] || '';
        for (var i = values.length; i > 0x2533 + 0x1105 + -0x3638; i--) {
          const expReg = RegExp('%' + i, 'g');
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    else getText2 = () => { };
    try {
      const Obj = {};
      Obj.api = api
      Obj.event = event
      Obj.args = args
      Obj.models = models
      Obj.Users = Users
      Obj.Threads = Threads
      Obj.Currencies = Currencies
      Obj.permssion = permssion
      Obj.getText = getText2
      command.run(Obj);
      timestamps.set(senderID, dateNow);
      if (DeveloperMode == !![])
        logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - dateNow), "[ DEV MODE ]");
      return;
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }
  };
};
