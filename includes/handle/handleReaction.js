module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;

        if (!Array.isArray(handleReaction) || handleReaction.length === 0) return;

        const index = handleReaction.findIndex(e => e.messageID === messageID);
        if (index === -1) return;

        const reactionData = handleReaction[index];
        const command = commands.get(reactionData.name);

        if (!command)
            return api.sendMessage(
                global.getText('handleReaction', 'missingValue'),
                threadID,
                messageID
            );

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
                        text = text.replace(new RegExp(`%${i}`, "g"), args[i]);
                    }
                    return text;
                };
            }

            command.handleReaction({
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: reactionData,
                getText
            });

        } catch (error) {
            api.sendMessage(
                global.getText(
                    'handleReaction',
                    'executeError',
                    error.message || String(error)
                ),
                threadID,
                messageID
            );
        }
    };
};                handleNeedExec.handleReaction(Obj);
                return;
            } catch (error) {
                return api.sendMessage(global.getText('handleReaction', 'executeError', error), threadID, messageID);
            }
        }
    };
};
