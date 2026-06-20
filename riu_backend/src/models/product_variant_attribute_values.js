module.exports = (sequelize, DataTypes) => {
  const ProductVariantAttributeValues = sequelize.define(
    "ProductVariantAttributeValue",
    {
      variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      attribute_value_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      tableName: "product_variant_attribute_values",
      timestamps: false,
    },
  );

  return ProductVariantAttributeValues;
};
