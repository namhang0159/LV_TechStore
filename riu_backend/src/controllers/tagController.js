const tagService = require("../services/tagService");

const createTag = async (req, res) => {
  try {
    const result = await tagService.createTagService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllTags = async (req, res) => {
  try {
    const result = await tagService.getAllTagsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const result = await tagService.deleteTagService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getTagById = async (req, res) => {
  try {
    const result = await tagService.getTagByIdService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  deleteTag,
};
