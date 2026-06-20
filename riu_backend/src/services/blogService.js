const { Blog, Author } = require("../models");

const getAllBlogsService = async () => {
  try {
    const blogs = await Blog.findAll({
      include: [
        {
          model: Author,
          required: false,
          attributes: ["id", "name", "avatar_url"]
        }
      ],
      order: [["created_at", "DESC"]],
    });

    return {
      message: "Blogs retrieved successfully",
      data: blogs,
    };
  } catch (error) {
    throw error;
  }
};

const getBlogByIdService = async (id) => {
  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: Author,
          required: false,
          attributes: ["id", "name", "avatar_url", "bio"]
        }
      ]
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    return {
      message: "Blog retrieved successfully",
      data: blog,
    };
  } catch (error) {
    throw error;
  }
};

const createBlogService = async (data) => {
  try {
    const { title, slug, content, author_id, thumbnail_url, status } = data;

    const newBlog = await Blog.create({
      title,
      slug,
      content,
      author_id,
      thumbnail_url,
      status: status || "published",
      created_at: new Date(),
    });

    return {
      message: "Blog created successfully",
      data: newBlog,
    };
  } catch (error) {
    throw error;
  }
};

const updateBlogService = async (id, data) => {
  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    const updatedBlog = await blog.update(data);
    return {
      message: "Blog updated successfully",
      data: updatedBlog,
    };
  } catch (error) {
    throw error;
  }
};

const deleteBlogService = async (id) => {
  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    await blog.destroy();
    return {
      message: "Blog deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllBlogsService,
  getBlogByIdService,
  createBlogService,
  updateBlogService,
  deleteBlogService,
};
