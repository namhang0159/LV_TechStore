module.exports = (sequelize, DataTypes) => {
  const ProductVariantImage = sequelize.define(
    "ProductVariantImage",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      variant_id: DataTypes.INTEGER,
      image_url: DataTypes.TEXT,
      sort_order: DataTypes.INTEGER,
      is_thumbnail: DataTypes.BOOLEAN,
    },
    {
      tableName: "product_variant_images",
      timestamps: false,
    },
  );

  return ProductVariantImage;
};
