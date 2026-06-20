module.exports = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define(
    "AttributeValue",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      attribute_id: DataTypes.INTEGER,
      value: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {
      tableName: "attribute_values",
      timestamps: false,
    },
  );

  return AttributeValue;
};
