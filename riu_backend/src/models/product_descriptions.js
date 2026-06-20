module.exports = (sequelize, DataTypes) => {
  const ProductDescriptions = sequelize.define(
    "ProductDescription",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      data_json: DataTypes.JSON,
    },
    {
      tableName: "product_descriptions",
      timestamps: false,
    },
  );

  return ProductDescriptions;
};
