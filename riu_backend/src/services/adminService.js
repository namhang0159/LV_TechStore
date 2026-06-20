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
      { expiresIn: "1d" }
    );

    return {
      success: true,
      data: { token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } }
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
module.exports = {
  loginAdminService,
  createAdminService,
  getAllAdminsService,
  fetchAdminService,
};
