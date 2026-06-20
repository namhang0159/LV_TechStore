const db = require("../models");

const assignTaskService = async (data) => {
  try {
    const task = await db.StaffTask.create({
      order_id: data.order_id,
      order_item_id: data.order_item_id || null,
      staff_id: data.staff_id,
      task_type: data.task_type,
      note: data.note,
      status: "pending",
      created_at: new Date()
    });
    return { success: true, message: "Task assigned successfully", data: task };
  } catch (error) {
    throw new Error("Error assigning task: " + error.message);
  }
};

const getStaffTasksService = async (staffId) => {
  try {
    const tasks = await db.StaffTask.findAll({
      where: { staff_id: staffId },
      include: [
        { model: db.Order, attributes: ['id', 'status', 'total_amount'] }
      ]
    });
    return { success: true, data: tasks };
  } catch (error) {
    throw new Error("Error fetching tasks: " + error.message);
  }
};

const updateTaskStatusService = async (id, staffId, status) => {
  try {
    const task = await db.StaffTask.findOne({ where: { id, staff_id: staffId } });
    if (!task) throw new Error("Task not found or unauthorized");

    const updateData = { status };
    if (status === "in_progress" && !task.started_at) {
      updateData.started_at = new Date();
    } else if (status === "completed") {
      updateData.completed_at = new Date();
    }

    await task.update(updateData);
    return { success: true, message: "Task updated", data: task };
  } catch (error) {
    throw new Error("Error updating task: " + error.message);
  }
};

module.exports = {
  assignTaskService,
  getStaffTasksService,
  updateTaskStatusService,
};
