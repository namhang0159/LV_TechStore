module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define(
    "Warehouse",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      location: DataTypes.STRING,
    },
    {
      tableName: "warehouses",
      timestamps: false,
    },
  );

  return Warehouse;
};
