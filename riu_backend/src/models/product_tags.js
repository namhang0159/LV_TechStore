module.exports = (sequelize, DataTypes) => {
  const ProductTags = sequelize.define(
    "ProductTag",
    {
      product_id: DataTypes.INTEGER,
      tag_id: DataTypes.INTEGER,
    },
    {
      tableName: "product_tags",
      timestamps: false,
    },
  );

  return ProductTags;
};
