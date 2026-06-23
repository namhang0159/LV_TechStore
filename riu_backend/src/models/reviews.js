module.exports = (sequelize, DataTypes) => {
  const ProductReview = sequelize.define(
    "ProductReview",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      tableName: "product_reviews",
      timestamps: false,
    },
  );

  return ProductReview;
};
