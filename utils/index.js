const assets = require("@miraipr0ject/assets");
const crypto = require("crypto");
const os = require("os");
const axios = require("axios");

const config = require("../config.json");
const pkg = require("../package.json"); // FIXED ❗

/* ================= YOUTUBE ================= */

module.exports.getYoutube = async function (query, type, mode) {
	try {
		if (type === "search") {
			if (!query) return null;
			const yt = require("youtube-search-api");
			const result = await yt.GetListByKeyword(query, false, 6);
			return result.items;
		}

		if (type === "getLink") {
			const res = await axios.post(
				"https://aiovideodl.ml/wp-json/aio-dl/video-data/",
				{ url: "https://www.youtube.com/watch?v=" + query }
			);

			const data = res.data;
			if (!data || !data.medias) return null;

			if (mode === "video") {
				return {
					title: data.title,
					duration: data.duration,
					download: {
						SD: data.medias?.[1]?.url,
						HD: data.medias?.[2]?.url
					}
				};
			}

			if (mode === "audio") {
				return {
					title: data.title,
					duration: data.duration,
					download: data.medias?.[3]?.url
				};
			}
		}
	} catch (err) {
		console.log("YouTube Error:", err.message);
		return null;
	}
};

/* ================= ERROR HANDLER ================= */

module.exports.throwError = function (command, threadID, messageID) {
	const threadSetting =
		global.data.threadData.get(parseInt(threadID)) || {};

	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	return global.client.api.sendMessage(
		global.getText("utils", "throwError", prefix, command),
		threadID,
		messageID
	);
};

/* ================= TEXT CLEANER ================= */

module.exports.cleanAnilistHTML = function (text = "") {
	return text
		.replace(/<br>/g, "\n")
		.replace(/<\/?(i|em)>/g, "*")
		.replace(/<\/?b>/g, "**")
		.replace(/~!|!~/g, "||")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'");
};

/* ================= FILE DOWNLOAD ================= */

module.exports.downloadFile = async function (url, filePath) {
	const fs = require("fs");

	const response = await axios({
		method: "GET",
		url,
		responseType: "stream"
	});

	const writer = fs.createWriteStream(filePath);
	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on("finish", resolve);
		writer.on("error", reject);
	});
};

/* ================= GET CONTENT ================= */

module.exports.getContent = async function (url) {
	try {
		return await axios.get(url);
	} catch (e) {
		console.log("GetContent Error:", e.message);
		return null;
	}
};

/* ================= RANDOM STRING ================= */

module.exports.randomString = function (length = 5) {
	const chars =
		"ABCDKCCzwKyY9rmBJGu48FrkNMro4AWtCkc1flmnopqrstuvwxyz";
	let res = "";
	for (let i = 0; i < length; i++) {
		res += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return res;
};

/* ================= ASSETS ================= */

module.exports.assets = {
	async font(name) {
		if (!assets.font.loaded) await assets.font.load();
		return assets.font.get(name);
	},
	async image(name) {
		if (!assets.image.loaded) await assets.image.load();
		return assets.image.get(name);
	},
	async data(name) {
		if (!assets.data.loaded) await assets.data.load();
		return assets.data.get(name);
	}
};

/* ================= AES ================= */

module.exports.AES = {
	encrypt(key, iv, data) {
		const cipher = crypto.createCipheriv(
			"aes-256-cbc",
			Buffer.from(key),
			Buffer.from(iv)
		);
		let encrypted = cipher.update(data);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return encrypted.toString("hex");
	},

	decrypt(key, iv, encrypted) {
		const decipher = crypto.createDecipheriv(
			"aes-256-cbc",
			Buffer.from(key),
			Buffer.from(iv)
		);
		let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	},

	makeIv() {
		return crypto.randomBytes(16).toString("hex").slice(0, 16);
	}
};

/* ================= HOME DIR ================= */

module.exports.homeDir = function () {
	let homeDir = process.env.HOME || null;
	let type = process.platform;

	if (os.homedir) homeDir = os.homedir();

	return [homeDir, type];
};
