require("dotenv").config();
const express = require("express");
const db = require("./config/database");
const authRoutes = require("./routes/api");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
const paymentGatewayRoute = require("./routes/paymentGatewayRoute");
app.use("/api/payments", paymentGatewayRoute);
app.get("/", (req, res) => {
  res.json({ message: "Hello API" });
});

const startServer = async () => {
  try {
    await db.authenticate();
    console.log("Database connected...");
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.sync();
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running on port", process.env.PORT || 8000);
    });
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
};

startServer();
