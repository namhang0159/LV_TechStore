module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      birth_date: DataTypes.DATE,
      level_points: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      status: DataTypes.STRING,
      last_login_at: DataTypes.DATE,
      refresh_token: DataTypes.STRING,
    },
    {
      tableName: "users",
      timestamps: false,
    },
  );

  return User;
};
