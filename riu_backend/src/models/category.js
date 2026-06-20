module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      icon: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "categories",
      timestamps: false,
    },
  );

  return Category;
};
