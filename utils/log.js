/**
 * Logger System
 * Fixed & Clean Version
 * By FAIZ-PROJECT 🤸
 */

const chalk = require("chalk");

/**
 * Main Logger
 * @param {string} message
 * @param {string} type info | warn | error
 */
module.exports = function (message, type = "info") {
  switch (type) {
    case "warn":
      console.log(
        chalk.bold.hex("#FF00FF")("[ Warning ] » ") + message
      );
      break;

    case "error":
      console.log(
        chalk.bold.hex("#ff334b")("[ Error ] » ") + message
      );
      break;

    default:
      console.log(
        chalk.bold.hex("#33ffc9")("[ Info ] » ") + message
      );
      break;
  }
};

/**
 * Loader Logger
 * @param {string} message
 * @param {string} type load | error | info
 */
module.exports.loader = function (message, type = "info") {
  switch (type) {
    case "load":
      console.log(
        chalk.bold.hex("#b4ff33")("[ 𝐅𝐀𝐈𝐙-𝐏𝐑𝐎𝐉𝐄𝐂𝐓 🤸 ] » ") + message
      );
      break;

    case "error":
      console.warn(
        chalk.bold.hex("#ff334b")("[ Error ] » ") + message
      );
      break;

    default:
      console.log(
        chalk.bold.hex("#33ffc9")("[ Loader ] » ") + message
      );
      break;
  }
};
