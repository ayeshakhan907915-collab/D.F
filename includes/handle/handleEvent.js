module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY");

        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;

        let { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // Block banned users / threads
        if (userBanned.has(senderID) || threadBanned.has(threadID)) return;

        // Inbox disable check
        if (!allowInbox && senderID === threadID) return;

        // Fix missing logMessageType
        const logType = event.logMessageType || event.type;

        for (const [key, eventModule] of events.entries()) {
            if (!eventModule.config?.eventType?.includes(logType)) continue;

            try {
                eventModule.run({
                    api,
                    event,
                    models,
                    Users,
                    Threads,
                    Currencies
                });

                if (DeveloperMode === true) {
                    logger(
                        global.getText(
                            'handleEvent',
                            'executeEvent',
                            time,
                            eventModule.config.name,
                            threadID,
                            Date.now() - timeStart
                        ),
                        '[ EVENT ]'
                    );
                }
            } catch (error) {
                logger(
                    global.getText(
                        'handleEvent',
                        'eventError',
                        eventModule.config.name,
                        error.message || String(error)
                    ),
                    'error'
                );
            }
        }
    };
};}
