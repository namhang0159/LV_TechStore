module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define(
    "Brand",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      logo: DataTypes.STRING,
    },
    {
      tableName: "brands",
      timestamps: false,
    },
  );

  return Brand;
};
