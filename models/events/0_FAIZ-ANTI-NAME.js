module.exports.config = {
    name: "antiname",
    eventType: ["log:user-nickname"],
    version: "1.0.0",
    credits: "FAIZ ANSARI",
    description: "Protect bot nickname from change"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
    try {
        const { logMessageData, threadID, author } = event;
        const botID = api.getCurrentUserID();
        const { BOTNAME, ADMINBOT } = global.config;

        // Only care if bot nickname is changed
        if (logMessageData.participant_id !== botID) return;
        if (author === botID) return;
        if (ADMINBOT.includes(author)) return;

        const threadData = await Threads.getData(threadID);
        const nicknames = threadData?.data?.nicknames || {};
        const botNick = nicknames[botID] || BOTNAME;

        // If nickname already correct, do nothing
        if (logMessageData.nickname === botNick) return;

        // Restore nickname
        await api.changeNickname(botNick, threadID, botID);

        await api.sendMessage(
            "🚫 सॉरी बॉस, आप मेरा नाम चेंज नहीं कर सकते 🙂✌️",
            threadID
        );

    } catch (err) {
        console.error("ANTINAME ERROR:", err);
    }
};
