module.exports = (sequelize, DataTypes) => {
  const SerialNumber = sequelize.define(
    "SerialNumber",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      variant_id: DataTypes.INTEGER,
      imei_or_serial_number: DataTypes.STRING,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
      warehouse_id: DataTypes.INTEGER,
    },
    {
      tableName: "serial_numbers",
      timestamps: false,
    }
  );

  return SerialNumber;
};
