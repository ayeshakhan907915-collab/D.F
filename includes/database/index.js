const Sequelize = require("sequelize");
const { resolve } = require("path");
const { DATABASE } = global.config;

// Detect dialect
let dialect = Object.keys(DATABASE)[0];
let storage = null;

// SQLite support
if (dialect === "sqlite") {
  storage = resolve(__dirname, `../${DATABASE.sqlite.storage}`);
}

const sequelize = new Sequelize(
  DATABASE[dialect].database || null,
  DATABASE[dialect].username || null,
  DATABASE[dialect].password || null,
  {
    dialect,
    storage,

    host: DATABASE[dialect].host || "localhost",
    port: DATABASE[dialect].port || undefined,

    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 20000
    },

    retry: {
      match: [/SQLITE_BUSY/],
      max: 20
    },

    logging: false,

    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true
    }
  }
);

// Auto sync safely
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ Database sync failed:", err));

module.exports = {
  sequelize,
  Sequelize
};
