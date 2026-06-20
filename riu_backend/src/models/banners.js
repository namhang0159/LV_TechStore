module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      image_url: DataTypes.TEXT,
      link: DataTypes.STRING,
      position: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "banners",
      timestamps: false,
    },
  );

  return Banner;
};
