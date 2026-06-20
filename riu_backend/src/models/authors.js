module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define(
    "Author",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING(255),
      bio: DataTypes.TEXT,
      avatar_url: DataTypes.STRING(255),
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "authors",
      timestamps: false,
    },
  );

  return Author;
};
