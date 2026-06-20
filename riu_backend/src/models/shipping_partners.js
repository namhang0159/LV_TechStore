module.exports = (sequelize, DataTypes) => {
  const ShippingPartner = sequelize.define(
    "ShippingPartner",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      api_code: DataTypes.STRING,
    },
    {
      tableName: "shipping_partners",
      timestamps: false,
    },
  );

  return ShippingPartner;
};
