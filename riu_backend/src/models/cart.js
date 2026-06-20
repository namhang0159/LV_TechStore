module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "carts",
      timestamps: false,
    },
  );

  return Cart;
};
