module.exports = (sequelize, DataTypes) => {
  const UserAddresses = sequelize.define(
    "user_addresses",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      receiver_name: DataTypes.STRING,
      phone: DataTypes.STRING,
      province: DataTypes.STRING,
      district: DataTypes.STRING,
      ward: DataTypes.STRING,
      address_line: DataTypes.TEXT,
      is_default: DataTypes.BOOLEAN,
    },
    {
      timestamps: false,
    },
  );

  return UserAddresses;
};
