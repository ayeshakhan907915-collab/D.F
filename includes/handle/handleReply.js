module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        if (!event.messageReply) return;

        const { handleReply, commands } = global.client;
        const { messageID, threadID, messageReply } = event;

        if (!Array.isArray(handleReply) || handleReply.length === 0) return;

        const index = handleReply.findIndex(
            e => e.messageID === messageReply.messageID
        );
        if (index === -1) return;

        const replyData = handleReply[index];
        const command = commands.get(replyData.name);

        if (!command) {
            return api.sendMessage(
                global.getText('handleReply', 'missingValue'),
                threadID,
                messageID
            );
        }

        try {
            let getText = () => "";

            if (command.languages && typeof command.languages === "object") {
                getText = (...args) => {
                    const langPack = command.languages[global.config.language];
                    if (!langPack) {
                        api.sendMessage(
                            global.getText(
                                'handleCommand',
                                'notFoundLanguage',
                                command.config.name
                            ),
                            threadID,
                            messageID
                        );
                        return "";
                    }

                    let text = langPack[args[0]] || "";
                    for (let i = 1; i < args.length; i++) {
                        text = text.replace(
                            new RegExp(`%${i}`, "g"),
                            args[i]
                        );
                    }
                    return text;
                };
            }

            command.handleReply({
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReply: replyData,
                getText
            });

        } catch (error) {
            api.sendMessage(
                global.getText(
                    'handleReply',
                    'executeError',
                    error.message || String(error)
                ),
                threadID,
                messageID
            );
        }
    };
};                handleNeedExec.handleReply(Obj);
                return;
            } catch (error) {
                return api.sendMessage(global.getText('handleReply', 'executeError', error), threadID, messageID);
            }
        }
    };
}
