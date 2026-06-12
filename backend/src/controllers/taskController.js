const taskService = require('../services/taskService');

/**
 * Fetches all tasks from the system.
 * Implements pagination and sorting via query parameters.
 */
const getAllTasks = async (req, res) => {
    try {
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
    } catch (error) {
        // Fallback for unexpected system errors
        console.error(error);
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

/**
 * Retrieves a specific task using its unique ID.
 */
const getTaskById = async (req, res) => {
    try {
        // Parse the task ID from the URL parameters
        const id = parseInt(req.params.id);
        const task = await taskService.getTaskByIdLogic(id);

        // Validation: Ensure the task exists before returning data
        if (!task) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `Task with ID ${id} was not found.`,
                    details: {}
                }
            });
        }

        res.status(200).json({
            success: true,
            data: task,
            error: null
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

/**
 * Creates a new task record.
 * Uses req.body to pass data to the Service.
 */
const createTask = async (req, res) => {
    try {
        // Pass the body to the service to handle data persistence/logic asynchronously
        const newTask = await taskService.createTaskLogic(req.body);

        // Return 201 Created status for successful post
        res.status(201).json({
            success: true,
            data: { taskId: newTask.taskId, message: "Task created successfully." },
            error: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

/**
 * Updates an existing task by ID.
 * Integrates error handling for specific business logic failures.
 */
const updateTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await taskService.updateTaskLogic(id, req.body);

        res.status(200).json({
            success: true,
            data: { taskId: id, message: "Task updated successfully." },
            error: null
        });
    } catch (error) {
        console.error(error);
        // Handle specific logic error: Task not found in database
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

/**
 * Deletes a task from the system.
 */
const deleteTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await taskService.deleteTaskLogic(id);

        res.status(200).json({
            success: true,
            data: { taskId: id, message: "Task deleted successfully." },
            error: null
        });
    } catch (error) {
        console.error(error);
        // Error handling for deletion of non-existent ID
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };