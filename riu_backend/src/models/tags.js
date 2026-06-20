module.exports = (sequelize, DataTypes) => {
  const Tags = sequelize.define(
    "Tag",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
    },
    {
      tableName: "tags",
      timestamps: false,
    },
  );

  return Tags;
};
