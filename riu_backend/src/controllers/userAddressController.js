const userAddressService = require("../services/userAddressService");

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userAddressService.getUserAddressesService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userAddressService.addUserAddressService(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userAddressService.updateUserAddressService(userId, addressId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userAddressService.deleteUserAddressService(userId, addressId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userAddressService.setDefaultAddressService(userId, addressId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
};
