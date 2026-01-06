module.exports = function ({ api, models }) {
    const fs = require("fs");
    const path = require("path");
    const Users = require("./controllers/users")({ models, api });
    const Threads = require("./controllers/threads")({ models, api });
    const Currencies = require("./controllers/currencies")({ models });
    const logger = require("../utils/log.js");
    const moment = require("moment-timezone");
    const axios = require("axios");

    let currentDay = moment.tz("Asia/Kolkata").day();
    const checkttDataPath = path.join(__dirname, "../models/commands/checktuongtac");

    /* ================= DAILY / WEEKLY TOP ================= */

    setInterval(async () => {
        try {
            const nowDay = moment.tz("Asia/Kolkata").day();
            if (currentDay === nowDay) return;
            currentDay = nowDay;

            const ADMIN_IDS = [
                ...(global.config.NDH || []),
                ...(global.config.ADMINBOT || [])
            ].map(String);

            const files = fs.existsSync(checkttDataPath)
                ? fs.readdirSync(checkttDataPath).filter(f => f.endsWith(".json"))
                : [];

            for (const file of files) {
                const boxID = file.replace(".json", "");
                if (
                    !ADMIN_IDS.includes(boxID) &&
                    !global.data.allThreadID.includes(boxID)
                ) continue;

                const filePath = path.join(checkttDataPath, file);
                const data = JSON.parse(fs.readFileSync(filePath));

                const buildTop = async (arr) => {
                    const list = [];
                    for (const u of arr) {
                        list.push({
                            ...u,
                            name: await Users.getNameUser(u.id) || "Unknown"
                        });
                    }
                    return list.sort(
                        (a, b) => b.count - a.count || a.name.localeCompare(b.name)
                    );
                };

                const dailyTop = await buildTop(data.day || []);
                let msg = "== PRIYANSH RAJPUT ❤️ ==\n\n";
                dailyTop.slice(0, 10).forEach((u, i) => {
                    msg += `${i + 1}. ${u.name} → ${u.count} messages\n`;
                });

                api.sendMessage(msg, boxID);
                data.day.forEach(u => (u.count = 0));

                /* WEEKLY RESET (MONDAY) */
                if (nowDay === 1 && Array.isArray(data.week)) {
                    const weekTop = await buildTop(data.week);
                    let wMsg = "== WEEKLY TOP ❤️ ==\n\n";
                    weekTop.slice(0, 10).forEach((u, i) => {
                        wMsg += `${i + 1}. ${u.name} → ${u.count} messages\n`;
                    });
                    api.sendMessage(wMsg, boxID);
                    data.week.forEach(u => (u.count = 0));
                }

                data.time = nowDay;
                fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            }
        } catch (e) {
            console.error("TOP ERROR:", e);
        }
    }, 60 * 1000);

    /* ================= LOAD DATABASE ================= */

    (async () => {
        try {
            logger("Loading environment...", "[ BOT ]");

            const threads = await Threads.getAll();
            const users = await Users.getAll(["userID", "name", "data"]);
            const currencies = await Currencies.getAll(["userID"]);

            for (const t of threads) {
                const id = String(t.threadID);
                global.data.allThreadID.push(id);
                global.data.threadData.set(id, t.data || {});
                global.data.threadInfo.set(id, t.threadInfo || {});
            }

            for (const u of users) {
                const id = String(u.userID);
                global.data.allUserID.push(id);
                if (u.name) global.data.userName.set(id, u.name);
            }

            currencies.forEach(c =>
                global.data.allCurrenciesID.push(String(c.userID))
            );

            logger("Environment loaded successfully", "[ BOT ]");
        } catch (err) {
            logger("Load failed", "error");
            console.error(err);
        }
    })();

    /* ================= HANDLERS ================= */

    const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
    const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
    const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
    const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

    /* ================= RETURN LISTENER ================= */

    return (event) => {
        try {
            switch (event.type) {
                case "message":
                case "message_reply":
                case "message_unsend":
                    handleCreateDatabase({ event });
                    handleCommand({ event });
                    handleReply({ event });
                    break;

                case "event":
                    handleEvent({ event });
                    break;

                case "message_reaction":
                    handleReaction({ event });
                    break;
            }
        } catch (e) {
            console.error("EVENT ERROR:", e);
        }
    };
};                        }
                        else if (a.count < b.count) {
                            return 1;
                        } else {
                            return a.name.localeCompare(b.name);
                        }
                    });
                    let checkttBody = '==PRIYANSH RAJPUT ❤️==\n\n';
                    checkttBody += storage.slice(0, 10).map(item => {
                        return `${count++}. ${item.name} with ${item.count} message`;
                    }).join('\n');
                    api.sendMessage(checkttBody, checkttFile.replace('.json', ''), (err) => err ? console.log(err) : '');
    
                    checktt.day.forEach(e => {
                        e.count = 0;
                    });
                    checktt.time = day_now;
                    fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));
                }
                resolve();
            })

            await new Promise(async resolve => {
                if (day_now == 1) {
                    console.log('Priyansh Rajput');
                    for (const checkttFile of checkttData) {
                        const checktt = JSON.parse(fs.readFileSync(checkttDataPath + checkttFile));
                        let storage = [], count = 1;
                        for (const item of checktt.week) {
                            const userName = await Users.getNameUser(item.id) || 'Priyansh Hun Yar';
                            const itemToPush = item;
                            itemToPush.name = userName;
                            storage.push(itemToPush);
                        };
                        storage.sort((a, b) => {
                            if (a.count > b.count) {
                                return -1;
                            }
                            else if (a.count < b.count) {
                                return 1;
                            } else {
                                return a.name.localeCompare(b.name);
                            }
                        });
                        let checkttBody = '==PRIYANSH RAJPUT ❤️==\n\n';
                        checkttBody += storage.slice(0, 10).map(item => {
                            return `${count++}. ${item.name} with ${item.count} message`;
                        }).join('\n');
                        api.sendMessage(checkttBody, checkttFile.replace('.json', ''), (err) => err ? console.log(err) : '');
                        checktt.week.forEach(e => {
                            e.count = 0;
                        });
                        fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));
                    }
                }
                resolve();
            })

            global.client.sending_top = false;
        }
      } catch(e) { console.error(e) }
    }, 1000 * 10);
    //////////////////////////////////////////////////////////////////////
    //========= Push all variable from database to environment =========//
    //////////////////////////////////////////////////////////////////////

    (async function () {

        try {
            logger(global.getText('listen', 'startLoadEnvironment'), '[ Priyansh Rajput ]');
            let threads = await Threads.getAll(),
                users = await Users.getAll(['userID', 'name', 'data']),
                currencies = await Currencies.getAll(['userID']);
            for (const data of threads) {
                const idThread = String(data.threadID);
                global.data.allThreadID.push(idThread),
                    global.data.threadData.set(idThread, data['data'] || {}),
                    global.data.threadInfo.set(idThread, data.threadInfo || {});
                if (data['data'] && data['data']['banned'] == !![])
                    global.data.threadBanned.set(idThread,
                        {
                            'reason': data['data']['reason'] || '',
                            'dateAdded': data['data']['dateAdded'] || ''
                        });
                if (data['data'] && data['data']['commandBanned'] && data['data']['commandBanned']['length'] != 0)
                    global['data']['commandBanned']['set'](idThread, data['data']['commandBanned']);
                if (data['data'] && data['data']['NSFW']) global['data']['threadAllowNSFW']['push'](idThread);
            }
            logger.loader(global.getText('listen', 'loadedEnvironmentThread'));
            for (const dataU of users) {
                const idUsers = String(dataU['userID']);
                global.data['allUserID']['push'](idUsers);
                if (dataU.name && dataU.name['length'] != 0) global.data.userName['set'](idUsers, dataU.name);
                if (dataU.data && dataU.data.banned == 1) global.data['userBanned']['set'](idUsers, {
                    'reason': dataU['data']['reason'] || '',
                    'dateAdded': dataU['data']['dateAdded'] || ''
                });
                if (dataU['data'] && dataU.data['commandBanned'] && dataU['data']['commandBanned']['length'] != 0)
                    global['data']['commandBanned']['set'](idUsers, dataU['data']['commandBanned']);
            }
            for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC['userID']));
            logger.loader(global.getText('listen', 'loadedEnvironmentUser')), logger(global.getText('listen', 'successLoadEnvironment'), '[ Priyansh ]');
        } catch (error) {
            return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
        }
    }());
    logger(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "" : global.config.BOTNAME}`, "[ Priyansh Rajput ]");

    ///////////////////////////////////////////////
    //========= Require all handle need =========//
    //////////////////////////////////////////////

    const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
    const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
    const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
    const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
    const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

    //DEFINE DATLICH PATH
    const datlichPath = __dirname + "/../models/commands/cache/datlich.json";

    //FUNCTION WORKS AS IT'S NAME, CRE: PRIYANSHU
    const monthToMSObj = {
        1: 31 * 24 * 60 * 60 * 1000,
        2: 28 * 24 * 60 * 60 * 1000,
        3: 31 * 24 * 60 * 60 * 1000,
        4: 30 * 24 * 60 * 60 * 1000,
        5: 31 * 24 * 60 * 60 * 1000,
        6: 30 * 24 * 60 * 60 * 1000,
        7: 31 * 24 * 60 * 60 * 1000,
        8: 31 * 24 * 60 * 60 * 1000,
        9: 30 * 24 * 60 * 60 * 1000,
        10: 31 * 24 * 60 * 60 * 1000,
        11: 30 * 24 * 60 * 60 * 1000,
        12: 31 * 24 * 60 * 60 * 1000
    };
    const checkTime = (time) => new Promise((resolve) => {
        time.forEach((e, i) => time[i] = parseInt(String(e).trim()));
        const getDayFromMonth = (month) => (month == 0) ? 0 : (month == 2) ? (time[2] % 4 == 0) ? 29 : 28 : ([1, 3, 5, 7, 8, 10, 12].includes(month)) ? 31 : 30;
        if (time[1] > 12 || time[1] < 1) resolve("Your month seems invalid");
        if (time[0] > getDayFromMonth(time[1]) || time[0] < 1) resolve("Your date seems invalid");
        if (time[2] < 2022) resolve("What era do you live in?");
        if (time[3] > 23 || time[3] < 0) resolve("Your time seems to be invalid");
        if (time[4] > 59 || time[3] < 0) resolve("Your minute seems invalid");
        if (time[5] > 59 || time[3] < 0) resolve("Your seconds seem invalid");
        yr = time[2] - 1970;
        yearToMS = (yr) * 365 * 24 * 60 * 60 * 1000;
        yearToMS += ((yr - 2) / 4).toFixed(0) * 24 * 60 * 60 * 1000;
        monthToMS = 0;
        for (let i = 1; i < time[1]; i++) monthToMS += monthToMSObj[i];
        if (time[2] % 4 == 0) monthToMS += 24 * 60 * 60 * 1000;
        dayToMS = time[0] * 24 * 60 * 60 * 1000;
        hourToMS = time[3] * 60 * 60 * 1000;
        minuteToMS = time[4] * 60 * 1000;
        secondToMS = time[5] * 1000;
        oneDayToMS = 24 * 60 * 60 * 1000;
        timeMs = yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - oneDayToMS;
        resolve(timeMs);
    });


    const tenMinutes = 10 * 60 * 1000;

    const checkAndExecuteEvent = async () => {

        /*smol check*/
        if (!fs.existsSync(datlichPath)) fs.writeFileSync(datlichPath, JSON.stringify({}, null, 4));
        var data = JSON.parse(fs.readFileSync(datlichPath));

        //GET CURRENT TIME
        var timeVN = moment().tz('Asia/Kolkata').format('DD/MM/YYYY_HH:mm:ss');
        timeVN = timeVN.split("_");
        timeVN = [...timeVN[0].split("/"), ...timeVN[1].split(":")];

        let temp = [];
        let vnMS = await checkTime(timeVN);
        const compareTime = e => new Promise(async (resolve) => {
            let getTimeMS = await checkTime(e.split("_"));
            if (getTimeMS < vnMS) {
                if (vnMS - getTimeMS < tenMinutes) {
                    data[boxID][e]["TID"] = boxID;
                    temp.push(data[boxID][e]); delete data[boxID][e];
                } else delete data[boxID][e];
                fs.writeFileSync(datlichPath, JSON.stringify(data, null, 4));
            };
            resolve();
        })

        await new Promise(async (resolve) => {
            for (boxID in data) {
                for (e of Object.keys(data[boxID])) await compareTime(e);
            }
            resolve();
        })
        for (el of temp) {
            try {
                var all = (await Threads.getInfo(el["TID"])).participantIDs;
                all.splice(all.indexOf(api.getCurrentUserID()), 1);
                var body = el.REASON || "🥰🥰🥰", mentions = [], index = 0;

                for (let i = 0; i < all.length; i++) {
                    if (i == body.length) body += " ‍ ";
                    mentions.push({
                        tag: body[i],
                        id: all[i],
                        fromIndex: i - 1
                    });
                }
            } catch (e) { return console.log(e); }
            var out = {
                body, mentions
            }
            if ("ATTACHMENT" in el) {
                out.attachment = [];
                for (a of el.ATTACHMENT) {
                    let getAttachment = (await axios.get(encodeURI(a.url), { responseType: "arraybuffer" })).data;
                    fs.writeFileSync(__dirname + `/../models/commands/cache/${a.fileName}`, Buffer.from(getAttachment, 'utf-8'));
                    out.attachment.push(fs.createReadStream(__dirname + `/../models/commands/cache/${a.fileName}`));
                }
            }
            console.log(out);
            if ("BOX" in el) await api.setTitle(el["BOX"], el["TID"]);
            api.sendMessage(out, el["TID"], () => ("ATTACHMENT" in el) ? el.ATTACHMENT.forEach(a => fs.unlinkSync(__dirname + `/../models/commands/cache/${a.fileName}`)) : "");
        }

    }
    setInterval(checkAndExecuteEvent, tenMinutes / 10);
    //////////////////////////////////////////////////
    //========= Send event to handle need =========//
    /////////////////////////////////////////////////

    return (event) => {
        switch (event.type) {
          case "message":
          case "message_reply":
          case "message_unsend":
            handleCreateDatabase({ event });
            handleCommand({ event });
            handleReply({ event });
            handleCommandEvent({ event });
    
            break;
          case "event":
            handleEvent({ event });
            break;
          case "message_reaction":
            handleReaction({ event });
            break;
          default:
            break;
        }
      };
};
