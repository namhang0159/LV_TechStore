module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: DataTypes.INTEGER,
      variant_id: DataTypes.INTEGER,
      product_name_snapshot: DataTypes.STRING,
      variant_name_snapshot: DataTypes.STRING,
      price_at_purchase: DataTypes.DECIMAL,
      quantity: DataTypes.INTEGER,
      total_price: DataTypes.DECIMAL,
    },
    {
      tableName: "order_items",
      timestamps: false,
    },
  );

  return OrderItem;
};
