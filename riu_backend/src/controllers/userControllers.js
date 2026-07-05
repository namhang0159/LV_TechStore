const { registerService, loginService, fetchMeService, refreshTokenService } = require("../services/userServices");

const register = async (req, res) => {
  try {
    const result = await registerService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
const fetchMe = async (req, res) => {
  try {
    const user = await fetchMeService(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken;
    const result = await refreshTokenService(token);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  fetchMe,
  refreshToken,
};
