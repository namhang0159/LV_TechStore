module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: DataTypes.INTEGER,
      payment_gateway: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      paid_at: DataTypes.DATE,
    },
    {
      tableName: "payments",
      timestamps: false,
    },
  );

  return Payment;
};
