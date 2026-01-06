module.exports.config = {
    name: "adminUpdate",
    eventType: [
        "log:thread-admins",
        "log:thread-name",
        "log:user-nickname",
        "log:thread-icon",
        "log:thread-color"
    ],
    version: "2.0.0",
    credits: "FAIZ ANSARI",
    description: "Update group information safely",
    envConfig: {
        sendNoti: true,
        autoUnsend: false,
        timeToUnsend: 10
    }
};

module.exports.run = async function ({ event, api, Threads }) {
    const fs = require("fs");
    const path = require("path");

    const iconPath = path.join(__dirname, "emoji.json");
    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}, null, 4));

    const { threadID, logMessageType, logMessageData, author, messageID } = event;
    const { getData, setData } = Threads;

    const threadSetting = global.data.threadData.get(threadID) || {};
    if (threadSetting.adminUpdate === false) return;

    try {
        let threadData = (await getData(threadID)).threadInfo || {};
        threadData.adminIDs = threadData.adminIDs || [];
        threadData.nicknames = threadData.nicknames || {};

        const cfg = global.configModule["adminUpdate"] || {};
        const sendNoti = cfg.sendNoti;

        const sendMsg = async (text) => {
            if (!sendNoti) return;
            api.sendMessage(text, threadID, async (err, info) => {
                if (!err && cfg.autoUnsend) {
                    setTimeout(() => api.unsendMessage(info.messageID), cfg.timeToUnsend * 1000);
                }
            });
        };

        switch (logMessageType) {

            /* ===== ADMIN UPDATE ===== */
            case "log:thread-admins": {
                const target = logMessageData.TARGET_ID;

                if (logMessageData.ADMIN_EVENT === "add_admin") {
                    if (!threadData.adminIDs.some(e => e.id === target))
                        threadData.adminIDs.push({ id: target });

                    await sendMsg(`👑 ADMIN UPDATE\nUser ${target} ab admin hai`);
                }

                if (logMessageData.ADMIN_EVENT === "remove_admin") {
                    threadData.adminIDs = threadData.adminIDs.filter(e => e.id !== target);
                    await sendMsg(`❌ ADMIN UPDATE\nUser ${target} ab admin nahi raha`);
                }
                break;
            }

            /* ===== GROUP ICON ===== */
            case "log:thread-icon": {
                const iconData = JSON.parse(fs.readFileSync(iconPath));
                const oldIcon = iconData[threadID] || "Unknown";
                const newIcon = logMessageData.thread_icon || "👍";

                threadData.threadIcon = newIcon;
                iconData[threadID] = newIcon;
                fs.writeFileSync(iconPath, JSON.stringify(iconData, null, 4));

                await sendMsg(`🖼 GROUP ICON UPDATED\nOld: ${oldIcon}\nNew: ${newIcon}`);
                break;
            }

            /* ===== GROUP COLOR ===== */
            case "log:thread-color": {
                threadData.threadColor = logMessageData.thread_color || "Default";
                await sendMsg(`🎨 GROUP COLOR UPDATED`);
                break;
            }

            /* ===== NICKNAME ===== */
            case "log:user-nickname": {
                const uid = logMessageData.participant_id;
                const nick = logMessageData.nickname || "";

                threadData.nicknames[uid] = nick;

                await sendMsg(
                    `✏️ NICKNAME UPDATE\nUser ${uid}\nNew: ${nick || "Original Name"}`
                );
                break;
            }

            /* ===== GROUP NAME ===== */
            case "log:thread-name": {
                threadData.threadName = logMessageData.name || "No name";
                await sendMsg(`📌 GROUP NAME UPDATED\n${threadData.threadName}`);
                break;
            }
        }

        await setData(threadID, { threadInfo: threadData });

    } catch (err) {
        console.error("ADMIN UPDATE ERROR:", err);
    }
};
