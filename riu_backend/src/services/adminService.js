const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginAdminService = async (email, password) => {
  try {
    const admin = await db.Admin.findOne({ where: { email } });
    if (!admin) {
      throw new Error("Admin not found");
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || "admin_secret",
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
      { expiresIn: "7d" }
    );

    await admin.update({ refresh_token: refreshToken });

    return {
      success: true,
      data: { token, refreshToken, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, position: admin.position } }
    };
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

const createAdminService = async (data) => {
  try {
    const existing = await db.Admin.findOne({ where: { email: data.email } });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newAdmin = await db.Admin.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      birth_date: data.birth_date,
      role: data.role || "staff",
      position: data.position || null,
      created_at: new Date()
    });

    // Exclude password from response
    const { password, ...adminData } = newAdmin.toJSON();

    return { success: true, message: "User created", data: adminData };
  } catch (error) {
    throw new Error("Error creating admin: " + error.message);
  }
};

const getAllAdminsService = async () => {
  try {
    const admins = await db.Admin.findAll({
      attributes: { exclude: ['password'] }
    });
    return { success: true, data: admins };
  } catch (error) {
    throw new Error("Error fetching admins: " + error.message);
  }
};
const fetchAdminService = async (id) => {
  try {
    const admin = await db.Admin.findOne({ where: { id }, attributes: { exclude: ['password'] } });
    if (!admin) throw new Error("Admin not found");
    return { success: true, data: admin };
  } catch (error) {
    throw new Error("Error fetching admin: " + error.message);
  }
}

const updateAdminService = async (id, data) => {
  try {
    const admin = await db.Admin.findOne({ where: { id } });
    if (!admin) throw new Error("Admin not found");

    if (data.email && data.email !== admin.email) {
      const existing = await db.Admin.findOne({ where: { email: data.email } });
      if (existing) throw new Error("Email already in use");
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await admin.update(data);
    const updatedAdmin = await db.Admin.findOne({ where: { id }, attributes: { exclude: ['password'] } });

    return { success: true, message: "User updated", data: updatedAdmin };
  } catch (error) {
    throw new Error("Error updating admin: " + error.message);
  }
};

const deleteAdminService = async (id) => {
  try {
    const admin = await db.Admin.findOne({ where: { id } });
    if (!admin) throw new Error("Admin not found");

    await admin.destroy();

    return { success: true, message: "User deleted" };
  } catch (error) {
    throw new Error("Error deleting admin: " + error.message);
  }
};
const refreshTokenAdminService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    const admin = await db.Admin.findByPk(decoded.id);

    if (!admin || admin.refresh_token !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || "admin_secret",
      { expiresIn: "1h" }
    );

    return {
      success: true,
      message: "Token refreshed successfully",
      data: { token: newAccessToken }
    };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

module.exports = {
  loginAdminService,
  createAdminService,
  getAllAdminsService,
  fetchAdminService,
  updateAdminService,
  deleteAdminService,
  refreshTokenAdminService,
};
