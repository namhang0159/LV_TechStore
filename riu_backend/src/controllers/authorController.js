const { getAllAuthorsService, createAuthorService } = require("../services/authorService");

const getAllAuthors = async (req, res) => {
  try {
    const result = await getAllAuthorsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAuthor = async (req, res) => {
  try {
    const result = await createAuthorService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAuthors,
  createAuthor
};
