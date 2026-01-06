module.exports = function ({ sequelize, Sequelize }) {
  const Currencies = sequelize.define(
    "Currencies",
    {
      num: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      userID: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
      },

      money: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      exp: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      }
    },
    {
      tableName: "currencies",
      timestamps: true
    }
  );

  return Currencies;
};
