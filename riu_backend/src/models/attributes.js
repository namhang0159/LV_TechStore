module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    "Attribute",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      filterable: DataTypes.BOOLEAN,
      category_id: DataTypes.INTEGER,
    },
    {
      tableName: "attributes",
      timestamps: false,
    },
  );

  return Attribute;
};
