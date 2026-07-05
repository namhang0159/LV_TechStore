const db = require("../models");
const { updateOrderStatusService } = require("./orderService");

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
        { model: db.Order, attributes: ['id', 'order_status', 'final_amount', 'payment_status', 'payment_method', 'shipping_address_json', 'order_code'] }
      ]
    });
    return { success: true, data: tasks };
  } catch (error) {
    throw new Error("Error fetching tasks: " + error.message);
  }
};

const updateTaskStatusService = async (id, staffId, status, payment_status) => {
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
    
    if (task.order_id) {
       const orderUpdateData = {};
       if (payment_status) {
         orderUpdateData.payment_status = payment_status;
       }
       if (task.task_type === 'shipping' && status === 'completed') {
         orderUpdateData.order_status = 'Delivered';
       }
       if (Object.keys(orderUpdateData).length > 0) {
         await updateOrderStatusService(task.order_id, orderUpdateData, staffId);
       }
    }

    return { success: true, message: "Task updated", data: task };
  } catch (error) {
    throw new Error("Error updating task: " + error.message);
  }
};

const getAllStaffTasksAdminService = async () => {
  try {
    const tasks = await db.StaffTask.findAll({
      include: [
        { model: db.Admin, attributes: ['id', 'name', 'email', 'role'] },
        { model: db.Order, attributes: ['id', 'order_status', 'final_amount', 'payment_status', 'payment_method', 'shipping_address_json', 'order_code'] }
      ],
      order: [['created_at', 'DESC']]
    });
    return { success: true, data: tasks };
  } catch (error) {
    throw new Error("Error fetching all tasks: " + error.message);
  }
};

const deleteTaskService = async (id) => {
  try {
    const task = await db.StaffTask.findByPk(id);
    if (!task) throw new Error("Task not found");
    
    await task.destroy();
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting task: " + error.message);
  }
};

module.exports = {
  assignTaskService,
  getStaffTasksService,
  updateTaskStatusService,
  getAllStaffTasksAdminService,
  deleteTaskService,
};
