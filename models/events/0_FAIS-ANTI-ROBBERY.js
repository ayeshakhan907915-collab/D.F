module.exports.config = {
    name: "antirobbery",
    eventType: ["log:thread-admins"],
    version: "2.0.0",
    credits: "FAIZ ANSARI",
    description: "Anti admin robbery protection"
};

module.exports.run = async function ({ event, api, Threads }) {
    try {
        const { logMessageType, logMessageData, threadID, author, messageID } = event;

        if (logMessageType !== "log:thread-admins") return;

        const threadData = (await Threads.getData(threadID)).data || {};
        if (!threadData.guard) return;

        const botID = api.getCurrentUserID();
        const targetID = logMessageData.TARGET_ID;
        const action = logMessageData.ADMIN_EVENT;

        // Ignore bot actions
        if (author === botID || targetID === botID) return;

        const notify = () => {
            api.sendMessage(
                "🚫 एंटीरॉबरी एक्टिव है बॉस 😐✌️\nबिना परमिशन एडमिन छेड़छाड़ मना है!",
                threadID,
                messageID
            );
        };

        // ADMIN ADDED (UNAUTHORIZED)
        if (action === "add_admin") {
            await api.changeAdminStatus(threadID, author, false);
            await api.changeAdminStatus(threadID, targetID, false);
            return notify();
        }

        // ADMIN REMOVED (UNAUTHORIZED)
        if (action === "remove_admin") {
            await api.changeAdminStatus(threadID, author, false);
            await api.changeAdminStatus(threadID, targetID, true);
            return notify();
        }

    } catch (err) {
        console.error("ANTI-ROBBERY ERROR:", err);
    }
};
