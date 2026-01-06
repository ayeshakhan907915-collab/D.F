module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "2.0.0",
    credits: "FAIZ ANSARI",
    description: "Notify when someone leaves the group with a random GIF"
};

module.exports.run = async function ({ api, event, Users }) {
    try {
        const axios = require("axios");
        const fs = require("fs-extra");
        const path = require("path");
        const moment = require("moment-timezone");

        const { threadID, author, logMessageData } = event;
        const leftID = logMessageData.leftParticipantFbId;
        const botID = api.getCurrentUserID();

        // Ignore bot leave
        if (leftID === botID) return;

        const name =
            (await Users.getNameUser(leftID)) ||
            global.data.userName.get(leftID) ||
            "उपयोगकर्ता";

        const reason =
            author === leftID
                ? "खुद ही भाग गया 😐👈"
                : "एडमिन ने गुस्से में निकाल दिया 😑👈";

        /* ===== TIME SESSION ===== */
        const hour = Number(moment.tz("Asia/Kolkata").format("HH"));
        let session =
            hour >= 5 && hour < 12 ? "सुबह" :
            hour >= 12 && hour < 17 ? "दोपहर" :
            hour >= 17 && hour < 21 ? "शाम" : "रात";

        /* ===== MESSAGE ===== */
        const msg =
`╭•┄┅═══❁🌺❁═══┅┄•╮
   😏  GOODBYE  😏
╰•┄┅═══❁🌺❁═══┅┄•╯

${session} की विदाई 😄✌️
नाम 𒁍 ${name}
रीजन 𒁍 ${reason}

CREATED BY MR FAIZ ANSARI ♥️`;

        /* ===== GIF HANDLING ===== */
        const gifLinks = [
            "https://i.imgur.com/aESbSZy.gif",
            "https://i.imgur.com/Yr0K0q0.gif",
            "https://i.imgur.com/MpBXhBb.gif",
            "https://i.imgur.com/lvzGoe5.gif"
        ];

        const gifURL = gifLinks[Math.floor(Math.random() * gifLinks.length)];
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const gifPath = path.join(cacheDir, `leave_${Date.now()}.gif`);
        const res = await axios.get(gifURL, { responseType: "arraybuffer" });
        fs.writeFileSync(gifPath, res.data);

        api.sendMessage(
            {
                body: msg,
                attachment: fs.createReadStream(gifPath)
            },
            threadID,
            () => fs.unlinkSync(gifPath)
        );

    } catch (err) {
        console.error("LEAVE EVENT ERROR:", err);
        api.sendMessage("⚠️ Leave notification भेजने में दिक्कत आई।", event.threadID);
    }
};
