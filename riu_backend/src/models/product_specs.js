module.exports = (sequelize, DataTypes) => {
  const ProductSpec = sequelize.define(
    "ProductSpec",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: DataTypes.INTEGER,
      group_name: DataTypes.STRING,
      label: DataTypes.STRING,
      value: DataTypes.STRING,
      sort_order: DataTypes.INTEGER,
    },
    {
      tableName: "product_specs",
      timestamps: false,
    },
  );

  return ProductSpec;
};
