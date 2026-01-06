module.exports = function (input) {
  const force = false; // ⚠️ production में true मत करना

  const Users = require("./models/users")(input);
  const Threads = require("./models/threads")(input);
  const Currencies = require("./models/currencies")(input);

  // Safe sync (async error catch)
  Promise.all([
    Users.sync({ force }),
    Threads.sync({ force }),
    Currencies.sync({ force })
  ])
    .then(() => {
      console.log("✅ Models synced successfully");
    })
    .catch(err => {
      console.error("❌ Model sync error:", err);
    });

  const models = {
    Users,
    Threads,
    Currencies
  };

  return {
    model: models,

    use(modelName) {
      if (!models[modelName]) {
        throw new Error(`Model "${modelName}" not found`);
      }
      return models[modelName];
    }
  };
};
