const db = require("../models");

const getUserAddressesService = async (userId) => {
  try {
    const addresses = await db.UserAddress.findAll({
      where: { user_id: userId },
      order: [
        ['is_default', 'DESC'],
        ['id', 'DESC']
      ]
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    throw new Error("Error fetching addresses: " + error.message);
  }
};

const addUserAddressService = async (userId, data) => {
  try {
    const { receiver_name, phone, province, district, ward, address_line, is_default } = data;

    // Check if this is the user's first address
    const existingAddressesCount = await db.UserAddress.count({ where: { user_id: userId } });
    
    let setAsDefault = is_default || existingAddressesCount === 0;

    if (setAsDefault) {
      // Unset any existing default
      await db.UserAddress.update(
        { is_default: false },
        { where: { user_id: userId, is_default: true } }
      );
    }

    const newAddress = await db.UserAddress.create({
      user_id: userId,
      receiver_name,
      phone,
      province,
      district,
      ward,
      address_line,
      is_default: setAsDefault,
    });

    return {
      success: true,
      message: "Address added successfully",
      data: newAddress,
    };
  } catch (error) {
    throw new Error("Error adding address: " + error.message);
  }
};

const updateUserAddressService = async (userId, addressId, data) => {
  try {
    const address = await db.UserAddress.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error("Address not found");
    }

    const { receiver_name, phone, province, district, ward, address_line, is_default } = data;

    if (is_default && !address.is_default) {
      // Unset other defaults
      await db.UserAddress.update(
        { is_default: false },
        { where: { user_id: userId, is_default: true } }
      );
    }

    await address.update({
      receiver_name: receiver_name !== undefined ? receiver_name : address.receiver_name,
      phone: phone !== undefined ? phone : address.phone,
      province: province !== undefined ? province : address.province,
      district: district !== undefined ? district : address.district,
      ward: ward !== undefined ? ward : address.ward,
      address_line: address_line !== undefined ? address_line : address.address_line,
      is_default: is_default !== undefined ? is_default : address.is_default,
    });

    return {
      success: true,
      message: "Address updated successfully",
      data: address,
    };
  } catch (error) {
    throw new Error("Error updating address: " + error.message);
  }
};

const deleteUserAddressService = async (userId, addressId) => {
  try {
    const address = await db.UserAddress.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error("Address not found");
    }

    const wasDefault = address.is_default;
    await address.destroy();

    // If we deleted the default address, set another one as default
    if (wasDefault) {
      const anotherAddress = await db.UserAddress.findOne({
        where: { user_id: userId },
        order: [['id', 'DESC']]
      });

      if (anotherAddress) {
        await anotherAddress.update({ is_default: true });
      }
    }

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error) {
    throw new Error("Error deleting address: " + error.message);
  }
};

const setDefaultAddressService = async (userId, addressId) => {
  try {
    const address = await db.UserAddress.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error("Address not found");
    }

    await db.UserAddress.update(
      { is_default: false },
      { where: { user_id: userId, is_default: true } }
    );

    await address.update({ is_default: true });

    return {
      success: true,
      message: "Default address updated successfully",
    };
  } catch (error) {
    throw new Error("Error setting default address: " + error.message);
  }
};

module.exports = {
  getUserAddressesService,
  addUserAddressService,
  updateUserAddressService,
  deleteUserAddressService,
  setDefaultAddressService,
};
