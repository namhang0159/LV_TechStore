module.exports = (sequelize, DataTypes) => {
  const StaffTask = sequelize.define(
    "StaffTask",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: DataTypes.INTEGER,
      order_item_id: DataTypes.INTEGER,
      staff_id: DataTypes.INTEGER,
      task_type: DataTypes.STRING,
      note: DataTypes.TEXT,
      started_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "staff_tasks",
      timestamps: false,
    }
  );

  return StaffTask;
};
