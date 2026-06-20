module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: DataTypes.INTEGER,
      sku: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "product_variants",
      timestamps: false,
    },
  );

  return ProductVariant;
};
