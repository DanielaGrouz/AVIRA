const { Task } = require('../../models');
const { NotFoundError } = require('../utils/errors'); // Import custom errors

/**
 * Handles the logic for retrieving a paginated and sorted list of tasks.
 */
const getAllTasksLogic = async (page = 1, limit = 5, sortBy = 'taskId') => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Task.findAndCountAll({
    order: [[sortBy, 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    data: rows,
  };
};

/**
 * Logic to find a specific task by its ID.
 * Throws a NotFoundError if the task doesn't exist.
 */
const getTaskByIdLogic = async (id) => {
  const task = await Task.findByPk(id);
  if (!task) {
    throw new NotFoundError(`Task with ID ${id} was not found.`, 'TASK_NOT_FOUND');
  }
  return task;
};

/**
 * Handles the creation of a new task.
 */
const createTaskLogic = async (taskData) => {
  const { eventId, title, status, priority } = taskData;

  return await Task.create({
    eventId,
    title,
    status: status || 'pending',
    priority: priority || 'medium',
  });
};

/**
 * Logic for updating an existing task.
 */
const updateTaskLogic = async (id, updateData) => {
  const { title, status, priority } = updateData;

  const [updatedRows] = await Task.update({ title, status, priority }, { where: { taskId: id } });

  if (updatedRows === 0) {
    throw new NotFoundError(`Task with ID ${id} not found.`, 'TASK_NOT_FOUND');
  }

  return await Task.findByPk(id);
};

/**
 * Removes a task from the system based on ID.
 */
const deleteTaskLogic = async (id) => {
  const deletedRows = await Task.destroy({
    where: { taskId: id },
  });

  if (deletedRows === 0) {
    throw new NotFoundError(`Task with ID ${id} not found.`, 'TASK_NOT_FOUND');
  }

  return true;
};

module.exports = {
  getAllTasksLogic,
  getTaskByIdLogic,
  createTaskLogic,
  updateTaskLogic,
  deleteTaskLogic,
};
