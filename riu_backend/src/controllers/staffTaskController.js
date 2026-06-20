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
    const { status } = req.body;
    const result = await staffTaskService.updateTaskStatusService(req.params.id, staffId, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  assignTask,
  getStaffTasks,
  updateTaskStatus,
};
