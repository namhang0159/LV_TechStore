module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "wishlists",
      timestamps: false,
    },
  );

  return Wishlist;
};
