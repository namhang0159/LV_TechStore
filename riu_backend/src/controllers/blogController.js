const { getAllBlogsService, getBlogByIdService, createBlogService } = require("../services/blogService");

const getAllBlogs = async (req, res) => {
  try {
    const result = await getAllBlogsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getBlogByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Blog not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const result = await createBlogService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateBlogService(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteBlogService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
