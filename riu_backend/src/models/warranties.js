module.exports = (sequelize, DataTypes) => {
  const Warranties = sequelize.define(
    "warranties",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      serial_number_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      purchase_date: DataTypes.DATE,
      expiry_date: DataTypes.DATE,
      status: DataTypes.STRING,
      order_id: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    },
  );

  return Warranties;
};
