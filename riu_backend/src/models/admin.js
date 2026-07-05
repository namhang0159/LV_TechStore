module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "admin",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      birth_date: DataTypes.DATE,
      role: DataTypes.ENUM("admin", "staff"),
      position: DataTypes.STRING,
      created_at: DataTypes.DATE,
      refresh_token: DataTypes.STRING,
    },
    {
      timestamps: false,
    },
  );

  return Admin;
};
