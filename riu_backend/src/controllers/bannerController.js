const bannerService = require("../services/bannerService");

const createBanner = async (req, res) => {
  try {
    const result = await bannerService.createBannerService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getActiveBanners = async (req, res) => {
  try {
    const { position } = req.query;
    const result = await bannerService.getActiveBannersService(position);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const result = await bannerService.updateBannerService(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const result = await bannerService.deleteBannerService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBanner,
  getActiveBanners,
  updateBanner,
  deleteBanner,
};
