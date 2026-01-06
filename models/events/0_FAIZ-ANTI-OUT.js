module.exports.config = {
    name: "Antiout",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "FAIZ ANSARI",
    description: "Prevent members from leaving the group"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    try {
        const { threadID, logMessageData, author } = event;
        const leftID = logMessageData.leftParticipantFbId;
        const botID = api.getCurrentUserID();

        // Ignore bot
        if (leftID === botID) return;

        const threadData = (await Threads.getData(threadID)).data || {};
        if (!threadData.antiout) return;

        // Only re-add if user left by themselves
        if (author !== leftID) return;

        const name =
            global.data.userName.get(leftID) ||
            (await Users.getNameUser(leftID)) ||
            "User";

        await api.addUserToGroup(leftID, threadID, (err) => {
            if (err) {
                api.sendMessage(
                    `❌ ${name} वापस नहीं आ सका 😕`,
                    threadID
                );
            } else {
                api.sendMessage(
                    `🔁 ${name} भागा था, वापस ले आया गया 😄✌️`,
                    threadID
                );
            }
        });

    } catch (err) {
        console.error("ANTIOUT ERROR:", err);
    }
};
