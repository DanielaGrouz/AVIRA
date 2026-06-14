const { Task } = require('../../models');
const { NotFoundError } = require('../utils/errors');

/**
 * Handles the creation of a new task.
 */
const createTaskLogic = async (taskData) => {
  const { eventId, title, status, priority } = taskData;

  return await Task.create({
    eventId,
    title,
    status: status,
    priority: priority,
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
  createTaskLogic,
  updateTaskLogic,
  deleteTaskLogic,
};
