module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      base_price: DataTypes.DECIMAL,
      description_short: DataTypes.TEXT,
      is_featured: DataTypes.BOOLEAN,
      is_best_seller: DataTypes.BOOLEAN,
      warranty_months: DataTypes.INTEGER,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "products",
      timestamps: false,
    },
  );

  return Product;
};
