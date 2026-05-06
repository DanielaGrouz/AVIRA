let tasks = require('../models/taskModel');

// Get all tasks (includes pagination and sorting to match other controllers)
const getAllTasks = (req, res) => {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || 'taskId';

    let sortedTasks = [...tasks].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

    res.status(200).json({
        success: true,
        data: { page: page, totalPages: Math.ceil(tasks.length / limit), data: paginatedTasks },
        error: null
    });
};

// Get a single task by its taskId
const getTaskById = (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.taskId === id);

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
};

// Get all tasks associated with a specific eventId
const getTasksByEventId = (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const eventTasks = tasks.filter(t => t.eventId === eventId);

    res.status(200).json({
        success: true,
        data: eventTasks,
        error: null
    });
};

// Create a new task
const createTask = (req, res) => {
    const { eventId, title, status, priority } = req.body;

    // Basic validation to ensure required fields exist
    if (!eventId || !title) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "eventId and title are required to create a task.",
                details: {}
            }
        });
    }

    // Generate a new sequential taskId based on the highest existing ID
    const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskId)) + 1 : 1;

    const newTask = {
        taskId: newTaskId,
        eventId,
        title,
        status: status || "pending",
        priority: priority || "medium"
    };

    tasks.push(newTask);

    res.status(201).json({
        success: true,
        data: { taskId: newTask.taskId, message: "Task created successfully." },
        error: null
    });
};

// Update an existing task
const updateTask = (req, res) => {
    const id = parseInt(req.params.id);
    const { title, status, priority } = req.body;

    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: "NOT_FOUND", message: "Task not found", details: {} }
        });
    }

    // Update only the provided fields, keep existing data otherwise
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title || tasks[taskIndex].title,
        status: status || tasks[taskIndex].status,
        priority: priority || tasks[taskIndex].priority
    };

    res.status(200).json({
        success: true,
        data: { taskId: id, message: "Task updated successfully." },
        error: null
    });
};

// Delete a task
const deleteTask = (req, res) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: "NOT_FOUND", message: "Task not found", details: {} }
        });
    }

    // Remove the task from the mock data array
    tasks.splice(taskIndex, 1);

    res.status(200).json({
        success: true,
        data: { taskId: id, message: "Task deleted successfully." },
        error: null
    });
};

module.exports = { getAllTasks, getTaskById, getTasksByEventId, createTask, updateTask, deleteTask };