module.exports = (sequelize, DataTypes) => {
  const UserVouchers = sequelize.define(
    "user_vouchers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      voucher_id: DataTypes.INTEGER,
      is_used: DataTypes.BOOLEAN,
      saved_at: DataTypes.DATE,
    },
    {
      timestamps: false,
    },
  );

  return UserVouchers;
};
