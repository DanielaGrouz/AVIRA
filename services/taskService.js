let tasks = require('../models/taskModel');

/**
 * Handles the logic for retrieving a paginated and sorted list of tasks.
 */
const getAllTasksLogic = (page = 1, limit = 5, sortBy = 'taskId') => {
    // Uses a shallow copy [...tasks] to prevent modifying the original array
    let sortedTasks = [...tasks].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    // Slice the array based on current page and item limit
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

    return {
        page: page,
        totalPages: Math.ceil(tasks.length / limit),
        data: paginatedTasks
    };
};

/**
 * Logic to find a specific task by its ID.
 * Returns null if the task doesn't exist.
 */
const getTaskByIdLogic = (id) => {
    return tasks.find(t => t.taskId === id) || null;
};

/**
 * Handles the creation of a new task.
 * Includes logic for automatic ID generation.
 */
const createTaskLogic = (taskData) => {
    const { eventId, title, status, priority } = taskData;

    // Generate a unique ID by finding the current maximum and adding 1
    const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskId)) + 1 : 1;

    const newTask = {
        taskId: newTaskId,
        eventId,
        title,
        status: status || "pending", // Default values if not provided
        priority: priority || "medium"
    };

    tasks.push(newTask);
    return newTask;
};

/**
 * Logic for updating an existing task.
 * Throws a specific Error "TASK_NOT_FOUND" for the controller to catch.
 */
const updateTaskLogic = (id, updateData) => {
    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        throw new Error("TASK_NOT_FOUND");
    }

    const { title, status, priority } = updateData;

    // Update logic: Overwrites provided fields while keeping existing ones
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title || tasks[taskIndex].title,
        status: status || tasks[taskIndex].status,
        priority: priority || tasks[taskIndex].priority
    };

    return tasks[taskIndex];
};

/**
 * Removes a task from the system based on ID.
 */
const deleteTaskLogic = (id) => {
    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        throw new Error("TASK_NOT_FOUND");
    }

    // Mutates the tasks array to remove the specific element
    tasks.splice(taskIndex, 1);
    return true;
};

module.exports = {
    getAllTasksLogic,
    getTaskByIdLogic,
    createTaskLogic,
    updateTaskLogic,
    deleteTaskLogic
};