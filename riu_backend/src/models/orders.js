module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_code: { type: DataTypes.STRING(191), unique: true },
      user_id: DataTypes.INTEGER,
      warehouse_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      total_base_price: DataTypes.DECIMAL,
      total_discount: DataTypes.DECIMAL,
      shipping_fee: DataTypes.DECIMAL,
      final_amount: DataTypes.DECIMAL,
      payment_method: DataTypes.STRING,
      delivery_method: DataTypes.STRING,
      payment_status: DataTypes.STRING,//Unpaid/Paid/Refunded
      order_status: DataTypes.STRING,//Pending --> Confirmed --> Shipping --> Delivered --> Cancel --> Returned / Completed 
      shipping_address_json: DataTypes.JSON,
      note: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "orders",
      timestamps: false,
    },
  );

  return Order;
};
