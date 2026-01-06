module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "2.0.0",
    credits: "FAIZ BABU",
    description: "Notify when members or bot join group"
};

module.exports.run = async function ({ api, event }) {
    try {
        const fs = require("fs-extra");
        const axios = require("axios");
        const path = require("path");

        const { threadID } = event;
        const botID = api.getCurrentUserID();

        /* ===== BOT JOIN ===== */
        if (event.logMessageData.addedParticipants.some(p => p.userFbId == botID)) {
            await api.changeNickname(
                `【 ${global.config.PREFIX} 】 ${global.config.BOTNAME}`,
                threadID,
                botID
            );

            return api.sendMessage(
`╭•┄┅═══❁🌺❁═══┅┄•╮
   💐  FAIZ BABU  💐
╰•┄┅═══❁🌺❁═══┅┄•╯

✧═══❁🌺 WELCOME 🌺❁═══✧
लो बॉस आ गया आपका FAIZ BABU 😄✌️

➤ PREFIX : 【 ${global.config.PREFIX} 】
➤ OWNER : MR FAIZ BABU 🌺

THANK YOU FOR USING BOT ❤️`,
                threadID
            );
        }

        /* ===== MEMBER JOIN ===== */
        const { threadName, participantIDs } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(threadID) || {};

        const gifLinks = [
            "https://i.imgur.com/Rl6Py22.gif",
            "https://i.imgur.com/WpOudX3.gif",
            "https://i.imgur.com/DuoVYZi.gif",
            "https://i.imgur.com/3M3lYay.gif"
        ];

        const membersAdded = event.logMessageData.addedParticipants;
        const names = [];
        const mentions = [];

        for (const p of membersAdded) {
            if (p.userFbId == botID) continue;

            const info = await api.getUserInfo(p.userFbId);
            const name = info[p.userFbId].name.replace("@", "");

            names.push(name);
            mentions.push({
                tag: name,
                id: p.userFbId
            });
        }

        if (!names.length) return;

        const memberCount = participantIDs.length;
        let msg = threadData.customJoin || 
`╭•┄┅═══❁🌺❁═══┅┄•╮
  💐 FAIZ ANSARI 💐
╰•┄┅═══❁🌺❁═══┅┄•╯

✨ WELCOME ✨
HELLO {uName} 👋
YOU ARE {soThanhVien}th MEMBER

GROUP : {threadName}
`;

        msg = msg
            .replace(/{uName}/g, names.join(", "))
            .replace(/{soThanhVien}/g, memberCount)
            .replace(/{threadName}/g, threadName);

        const imgPath = path.join(__dirname, "cache", "welcome.gif");
        const gifURL = gifLinks[Math.floor(Math.random() * gifLinks.length)];

        const res = await axios.get(gifURL, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, res.data);

        api.sendMessage(
            {
                body: msg,
                attachment: fs.createReadStream(imgPath),
                mentions
            },
            threadID,
            () => fs.unlinkSync(imgPath)
        );

    } catch (err) {
        console.error("JOIN NOTI ERROR:", err);
    }
};
