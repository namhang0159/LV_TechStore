const { Author } = require("../models");

const getAllAuthorsService = async () => {
  try {
    const authors = await Author.findAll();
    return {
      message: "Authors retrieved successfully",
      data: authors,
    };
  } catch (error) {
    throw error;
  }
};

const createAuthorService = async (data) => {
  try {
    const { name, bio, avatar_url } = data;
    const newAuthor = await Author.create({
      name,
      bio,
      avatar_url,
      created_at: new Date(),
    });

    return {
      message: "Author created successfully",
      data: newAuthor,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllAuthorsService,
  createAuthorService,
};
