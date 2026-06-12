const { Task } = require('../../models');

/**
 * Handles the logic for retrieving a paginated and sorted list of tasks.
 */
const getAllTasksLogic = async (page = 1, limit = 5, sortBy = 'taskId') => {
    const offset = (page - 1) * limit;

    // findAndCountAll fetches the specific page data and the total count in one efficient query
    const { count, rows } = await Task.findAndCountAll({
        order: [[sortBy, 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return {
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        data: rows
    };
};

/**
 * Logic to find a specific task by its ID.
 * Returns null if the task doesn't exist.
 */
const getTaskByIdLogic = async (id) => {
    return await Task.findByPk(id);
};

/**
 * Handles the creation of a new task.
 * ID generation is now handled automatically by the MySQL autoIncrement configuration.
 */
const createTaskLogic = async (taskData) => {
    const { eventId, title, status, priority } = taskData;

    return await Task.create({
        eventId,
        title,
        status: status || "pending", // Default values if not provided
        priority: priority || "medium"
    });
};

/**
 * Logic for updating an existing task.
 * Throws a specific Error "TASK_NOT_FOUND" for the controller to catch.
 */
const updateTaskLogic = async (id, updateData) => {
    // Destructure to ensure we only pass valid fields to the update method
    const { title, status, priority } = updateData;

    const [updatedRows] = await Task.update(
        { title, status, priority },
        { where: { taskId: id } }
    );

    if (updatedRows === 0) {
        throw new Error("TASK_NOT_FOUND");
    }

    // Fetch and return the updated record
    return await Task.findByPk(id);
};

/**
 * Removes a task from the system based on ID.
 */
const deleteTaskLogic = async (id) => {
    const deletedRows = await Task.destroy({
        where: { taskId: id }
    });

    if (deletedRows === 0) {
        throw new Error("TASK_NOT_FOUND");
    }

    return true;
};

module.exports = {
    getAllTasksLogic,
    getTaskByIdLogic,
    createTaskLogic,
    updateTaskLogic,
    deleteTaskLogic
};