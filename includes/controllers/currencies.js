module.exports = function ({ models }) {
  const Currencies = models.use("Currencies");

  async function getAll(...data) {
    let where = {}, attributes;

    for (const i of data) {
      if (typeof i !== "object")
        throw global.getText("currencies", "needObjectOrArray");

      if (Array.isArray(i)) attributes = i;
      else where = i;
    }

    try {
      const res = await Currencies.findAll({ where, attributes });
      return res.map(e => e.get({ plain: true }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function getData(userID) {
    try {
      const data = await Currencies.findOne({ where: { userID } });
      return data ? data.get({ plain: true }) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function setData(userID, options = {}) {
    if (typeof options !== "object")
      throw global.getText("currencies", "needObject");

    try {
      const data = await Currencies.findOne({ where: { userID } });
      if (!data) return false;

      await data.update(options);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function delData(userID) {
    try {
      const data = await Currencies.findOne({ where: { userID } });
      if (!data) return false;

      await data.destroy();
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function createData(userID, defaults = {}) {
    if (typeof defaults !== "object")
      throw global.getText("currencies", "needObject");

    try {
      await Currencies.findOrCreate({
        where: { userID },
        defaults
      });
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function increaseMoney(userID, money) {
    if (typeof money !== "number")
      throw global.getText("currencies", "needNumber");

    try {
      const data = await getData(userID);
      if (!data) return false;

      await setData(userID, { money: data.money + money });
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function decreaseMoney(userID, money) {
    if (typeof money !== "number")
      throw global.getText("currencies", "needNumber");

    try {
      const data = await getData(userID);
      if (!data) return false;
      if (data.money < money) return false;

      await setData(userID, { money: data.money - money });
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return {
    getAll,
    getData,
    setData,
    delData,
    createData,
    increaseMoney,
    decreaseMoney
  };
};
