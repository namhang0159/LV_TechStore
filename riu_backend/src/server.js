require("dotenv").config();
const express = require("express");
const db = require("./config/database");
const authRoutes = require("./routes/api");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

app.use(helmet());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // increased for development
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", apiLimiter);

app.use("/api", authRoutes);
const paymentGatewayRoute = require("./routes/paymentGatewayRoute");
app.use("/api/payments", paymentGatewayRoute);
const chatRoute = require("./routes/chatRoute");
app.use("/api/chat", chatRoute);
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
