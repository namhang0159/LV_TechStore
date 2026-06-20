module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "order_status_history",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      note: DataTypes.TEXT,
      changed_by: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "order_status_history",
      timestamps: false,
    },
  );

  return OrderStatusHistory;
};
