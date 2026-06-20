module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cart_id: DataTypes.INTEGER,
      variant_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      tableName: "cart_items",
      timestamps: false,
    },
  );

  return CartItem;
};
