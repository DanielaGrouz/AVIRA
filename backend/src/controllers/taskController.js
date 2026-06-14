const taskService = require('../services/taskService');
const {asyncHandler} = require('../middleware/errorHandler');

/**
 * Fetches all tasks from the system.
 * Implements pagination and sorting via query parameters.
 */
const getAllTasks = asyncHandler(async (req, res) => {
    // Extract pagination and sorting parameters from req.query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortBy = req.query.sortBy || 'taskId';

    // Execute core business logic via the service layer asynchronously
    const result = await taskService.getAllTasksLogic(page, limit, sortBy);

    // Standard success response structure
    res.status(200).json({
        success: true,
        data: result,
        error: null
    });
});

/**
 * Retrieves a specific task using its unique ID.
 */
const getTaskById = asyncHandler(async (req, res) => {
    // Parse the task ID from the URL parameters
    const id = parseInt(req.params.id);
    const task = await taskService.getTaskByIdLogic(id);

    // Validation: Ensure the task exists before returning data
    if (!task) {
        // Throwing the error lets the global errorHandler catch it and return a 404
        throw new Error("TASK_NOT_FOUND");
    }

    res.status(200).json({
        success: true,
        data: task,
        error: null
    });
});

/**
 * Creates a new task record.
 * Uses req.body to pass data to the Service.
 */
const createTask = asyncHandler(async (req, res) => {
    // Pass the body to the service to handle data persistence/logic asynchronously
    const newTask = await taskService.createTaskLogic(req.body);

    // Return 201 Created status for successful post
    res.status(201).json({
        success: true,
        data: { taskId: newTask.taskId, message: "Task created successfully." },
        error: null
    });
});

/**
 * Updates an existing task by ID.
 * Integrates error handling for specific business logic failures.
 */
const updateTask = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await taskService.updateTaskLogic(id, req.body);

    res.status(200).json({
        success: true,
        data: { taskId: id, message: "Task updated successfully." },
        error: null
    });
});

/**
 * Deletes a task from the system.
 */
const deleteTask = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await taskService.deleteTaskLogic(id);

    res.status(200).json({
        success: true,
        data: { taskId: id, message: "Task deleted successfully." },
        error: null
    });
});

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };