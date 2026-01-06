module.exports = {
  config: {
    name: "linkAutoDownload",
    version: "1.5.0",
    hasPermssion: 0,
    credits: "FAIZ ANSARI",
    description: "Auto detect video links and download",
    commandCategory: "Utilities",
    usages: "",
    cooldowns: 8,
  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");
    const { alldown } = require("nayan-media-downloader");

    try {
      if (!event.body) return;

      const text = event.body.trim();

      // sirf link se start ho tabhi chale
      if (!/^https?:\/\//i.test(text)) return;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const result = await alldown(text).catch(() => null);
      if (!result || !result.data || !result.data.high) {
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const { high, title } = result.data;

      const cachePath = path.join(__dirname, "cache");
      const filePath = path.join(cachePath, `auto_${Date.now()}.mp4`);

      await fs.ensureDir(cachePath);

      const video = await axios.get(high, {
        responseType: "arraybuffer",
        timeout: 60000,
      });

      await fs.writeFile(filePath, video.data);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return api.sendMessage(
        {
          body: `🎬 𝗧𝗜𝗧𝗟𝗘:\n${title || "Unknown"}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlink(filePath),
        event.messageID
      );
    } catch (e) {
      console.error("[AutoDownload]", e);
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
    }
  },
};
