module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define(
    "Voucher",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: DataTypes.STRING,
      discount_type: DataTypes.STRING,
      discount_value: DataTypes.DECIMAL,
      min_order_value: DataTypes.DECIMAL,
      max_discount: DataTypes.DECIMAL,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      usage_limit: DataTypes.INTEGER,
      min_level_points: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "vouchers",
      timestamps: false,
    },
  );

  return Voucher;
};
