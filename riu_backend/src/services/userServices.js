const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const registerService = async (userData) => {
  const { name, email, phone, password, birth_date } = userData;

  if (!name || !email || !phone || !password || !birth_date) {
    throw new Error("All fields are required");
  }

  const verifyEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!verifyEmail) {
    throw new Error("Invalid email format");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    birth_date,
    created_at: new Date(),
    status: "active",
  });

  return {
    message: "User registered successfully",
  };
};

const loginService = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ where: { email } });
  const lastloginAt = new Date();

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong password");
  }
  if (user) {
    await User.update(
      { last_login_at: lastloginAt },
      { where: { id: user.id } }
    );
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "admin_secret", {
    expiresIn: "1d",
  });

  return {
    message: "Login success",
    token,
    user,
  };
};
const fetchMeService = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

module.exports = {
  registerService,
  loginService,
  fetchMeService,
};
