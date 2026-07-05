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
    expiresIn: "1h",
  });
  
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
  
  await user.update({ refresh_token: refreshToken });

  return {
    message: "Login success",
    token,
    refreshToken,
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

const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    const user = await User.findByPk(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "admin_secret", {
      expiresIn: "1h",
    });

    return {
      message: "Token refreshed successfully",
      token: newAccessToken,
    };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

module.exports = {
  registerService,
  loginService,
  fetchMeService,
  refreshTokenService,
};
