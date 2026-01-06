module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity");
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    if (!event || !event.body) return;

    const dateNow = Date.now();
    const time = moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY");

    const {
      allowInbox,
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
    if (
      (userBanned.has(senderID) || threadBanned.has(threadID)) &&
      !ADMINBOT.includes(senderID)
    ) return;

    /* ===== COMMAND PARSE ===== */
    const [matchedPrefix] = body.match(prefixRegex);
    const args = body.slice(matchedPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    let command = commands.get(commandName);

    /* ===== COMMAND NOT FOUND ===== */
    if (!command) {
      const allCommands = [...commands.keys()];
      const check = stringSimilarity.findBestMatch(commandName, allCommands);
      if (check.bestMatch.rating >= 0.5)
        command = commands.get(check.bestMatch.target);
      else
        return api.sendMessage(
          global.getText("handleCommand", "commandNotExist", commandName),
          threadID,
          messageID
        );
    }

    /* ===== NSFW CHECK ===== */
    if (
      command.config.commandCategory?.toLowerCase() === "nsfw" &&
      !global.data.threadAllowNSFW.includes(threadID) &&
      !ADMINBOT.includes(senderID)
    )
      return api.sendMessage(
        global.getText("handleCommand", "threadNotAllowNSFW"),
        threadID,
        messageID
      );

    /* ===== PERMISSION CHECK ===== */
    let permssion = 0;
    const tInfo =
      threadInfo.get(threadID) || (await Threads.getInfo(threadID));
    const isAdmin = tInfo.adminIDs?.some((e) => e.id == senderID);

    if (NDH.includes(senderID)) permssion = 2;
    if (ADMINBOT.includes(senderID)) permssion = 3;
    else if (isAdmin) permssion = 1;

    if (command.config.hasPermssion > permssion)
      return api.sendMessage(
        global.getText(
          "handleCommand",
          "permssionNotEnough",
          command.config.name
        ),
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
        `⏳ Thoda ruk jao ${left.toFixed(1)} sec`,
        threadID,
        messageID
      );
    }

    /* ===== LANGUAGE HANDLER ===== */
    let getText = () => "";
    if (
      command.languages &&
      command.languages[global.config.language]
    ) {
      getText = (...values) => {
        let lang =
          command.languages[global.config.language][values[0]] || "";
        values.slice(1).forEach((v, i) => {
          lang = lang.replace(new RegExp(`%${i + 1}`, "g"), v);
        });
        return lang;
      };
    }

    /* ===== EXECUTE ===== */
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
        getText
      });

      timestamps.set(senderID, dateNow);

      if (DeveloperMode)
        logger(
          `[DEV] ${commandName} | ${senderID} | ${threadID} | ${
            Date.now() - dateNow
          }ms`
        );
    } catch (err) {
      console.error(err);
      return api.sendMessage(
        global.getText("handleCommand", "commandError", commandName),
        threadID,
        messageID
      );
    }
  };
};                Obj.Threads = Threads;
                Obj.Currencies = Currencies;
                Obj.getText = getText2;
                if (cmd) cmd.handleEvent(Obj);
            } catch (error) {
                logger(global.getText('handleCommandEvent', 'moduleError', cmd.config.name), 'error');
            }
        }
    };
};
