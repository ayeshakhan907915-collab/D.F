module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    return async function ({ event }) {
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data;
        const { autoCreateDB } = global.config;

        // Auto DB creation disabled
        if (!autoCreateDB) return;

        let { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        try {
            /* ================= THREAD CREATE ================= */
            if (!allThreadID.includes(threadID) && event.isGroup === true) {
                const threadIn4 = await Threads.getInfo(threadID);

                const dataThread = {
                    threadName: threadIn4.threadName,
                    adminIDs: threadIn4.adminIDs,
                    nicknames: threadIn4.nicknames
                };

                allThreadID.push(threadID);
                threadInfo.set(threadID, dataThread);

                await Threads.setData(threadID, {
                    threadInfo: dataThread,
                    data: {}
                });

                // Create users from group
                for (const singleData of threadIn4.userInfo) {
                    const uid = String(singleData.id);
                    userName.set(uid, singleData.name);

                    if (!allUserID.includes(uid)) {
                        await Users.createData(uid, {
                            name: singleData.name,
                            data: {}
                        });
                        allUserID.push(uid);
                        logger(
                            global.getText('handleCreateDatabase', 'newUser', uid),
                            '[ DATABASE ]'
                        );
                    }
                }

                logger(
                    global.getText('handleCreateDatabase', 'newThread', threadID),
                    '[ DATABASE ]'
                );
            }

            /* ================= USER CREATE ================= */
            if (!allUserID.includes(senderID)) {
                const infoUsers = await Users.getInfo(senderID);

                await Users.createData(senderID, {
                    name: infoUsers.name,
                    data: {}
                });

                allUserID.push(senderID);
                userName.set(senderID, infoUsers.name);

                logger(
                    global.getText('handleCreateDatabase', 'newUser', senderID),
                    '[ DATABASE ]'
                );
            }

            /* ================= CURRENCY CREATE ================= */
            if (!allCurrenciesID.includes(senderID)) {
                await Currencies.createData(senderID, { data: {} });
                allCurrenciesID.push(senderID);
            }

        } catch (err) {
            console.error("[ HANDLE CREATE DB ERROR ]", err);
        }
    };
};                        logger(global.getText('handleCreateDatabase', 'newUser', singleData.id), '[ DATABASE ]'));
                    } catch(e) { console.log(e) };
                }
                logger(global.getText('handleCreateDatabase', 'newThread', threadID), '[ DATABASE ]');
            }
            if (!allUserID.includes(senderID) || !userName.has(senderID)) {
                const infoUsers = await Users.getInfo(senderID),
                    setting3 = {};
                setting3.name = infoUsers.name
                await Users.createData(senderID, setting3)
                allUserID.push(senderID) 
                userName.set(senderID, infoUsers.name)
                logger(global.getText('handleCreateDatabase', 'newUser', senderID), '[ DATABASE ]');
            }
            if (!allCurrenciesID.includes(senderID)) {
                const setting4 = {};
                setting4.data = {}
                await Currencies.createData(senderID, setting4) 
                allCurrenciesID.push(senderID);
            }
            return;
        } catch (err) {
            return console.log(err);
        }
    };
}
