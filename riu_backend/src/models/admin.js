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
      created_at: DataTypes.DATE,
    },
    {
      timestamps: false,
    },
  );

  return Admin;
};
