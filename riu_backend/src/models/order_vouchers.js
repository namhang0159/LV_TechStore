module.exports = (sequelize, DataTypes) => {
  const OrderVouchers = sequelize.define(
    "order_vouchers",
    {
      order_id: DataTypes.INTEGER,
      voucher_id: DataTypes.INTEGER,
      discount_amount: DataTypes.DECIMAL,
    },
    {
      timestamps: false,
    },
  );

  return OrderVouchers;
};
