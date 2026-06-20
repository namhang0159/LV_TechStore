module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: DataTypes.STRING(255),
      slug: { type: DataTypes.STRING(255), unique: true },
      content: DataTypes.TEXT("long"),
      author_id: DataTypes.INTEGER,
      thumbnail_url: DataTypes.STRING(255),
      status: DataTypes.STRING(50), // e.g. "published", "draft"
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "blogs",
      timestamps: false,
    },
  );

  return Blog;
};
