const staffTaskService = require("../services/staffTaskService");

const assignTask = async (req, res) => {
  try {
    const result = await staffTaskService.assignTaskService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getStaffTasks = async (req, res) => {
  try {
    const staffId = req.user.id;
    const result = await staffTaskService.getStaffTasksService(staffId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { status, payment_status } = req.body;
    const result = await staffTaskService.updateTaskStatusService(req.params.id, staffId, status, payment_status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllTasksAdmin = async (req, res) => {
  try {
    const result = await staffTaskService.getAllStaffTasksAdminService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const result = await staffTaskService.deleteTaskService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  assignTask,
  getStaffTasks,
  updateTaskStatus,
  getAllTasksAdmin,
  deleteTask,
};
