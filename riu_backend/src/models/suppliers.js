module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      contact: DataTypes.STRING,
    },
    {
      tableName: "suppliers",
      timestamps: false,
    }
  );

  return Supplier;
};
