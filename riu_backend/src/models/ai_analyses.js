module.exports = (sequelize, DataTypes) => {
  const AiAnalysis = sequelize.define(
    "ai_analyses",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      analysis_type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // we only need one record per analysis type: 'behavioral' and 'customer_behavior'
      },
      analysis_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return AiAnalysis;
};
