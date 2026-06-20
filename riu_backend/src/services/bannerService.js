const db = require("../models");

const createBannerService = async (data) => {
  try {
    const banner = await db.Banner.create({
      image_url: data.image_url,
      link: data.link,
      position: data.position,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date()
    });
    return { success: true, message: "Banner created", data: banner };
  } catch (error) {
    throw new Error("Error creating banner: " + error.message);
  }
};

const getActiveBannersService = async (position) => {
  try {
    const whereClause = { is_active: true };
    if (position) whereClause.position = position;

    const banners = await db.Banner.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    return { success: true, data: banners };
  } catch (error) {
    throw new Error("Error fetching banners: " + error.message);
  }
};

const updateBannerService = async (id, data) => {
  try {
    const banner = await db.Banner.findByPk(id);
    if (!banner) throw new Error("Banner not found");

    await banner.update({
      image_url: data.image_url || banner.image_url,
      link: data.link || banner.link,
      position: data.position || banner.position,
      is_active: data.is_active !== undefined ? data.is_active : banner.is_active,
    });
    return { success: true, message: "Banner updated", data: banner };
  } catch (error) {
    throw new Error("Error updating banner: " + error.message);
  }
};

const deleteBannerService = async (id) => {
  try {
    const banner = await db.Banner.findByPk(id);
    if (!banner) throw new Error("Banner not found");
    await banner.destroy();
    return { success: true, message: "Banner deleted" };
  } catch (error) {
    throw new Error("Error deleting banner: " + error.message);
  }
};

module.exports = {
  createBannerService,
  getActiveBannersService,
  updateBannerService,
  deleteBannerService,
};
