// let tasks = require('../models/taskModel');
//
// const getAllTasks = (req, res) => {
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'taskId';
//
//     let sortedTasks = [...tasks].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedTasks = sortedTasks.slice(startIndex, endIndex);
//
//     res.status(200).json({
//         success: true,
//         data: { page: page, totalPages: Math.ceil(tasks.length / limit), data: paginatedTasks },
//         error: null
//     });
// };
//
// const getTaskById = (req, res) => {
//     const id = parseInt(req.params.id);
//     const task = tasks.find(t => t.taskId === id);
//
//     if (!task) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: `Task with ID ${id} was not found.`,
//                 details: {}
//             }
//         });
//     }
//
//     res.status(200).json({
//         success: true,
//         data: task,
//         error: null
//     });
// };
//
// const createTask = (req, res) => {
//     const { eventId, title, status, priority } = req.body;
//     const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskId)) + 1 : 1;
//
//     const newTask = {
//         taskId: newTaskId,
//         eventId,
//         title,
//         status: status || "pending",
//         priority: priority || "medium"
//     };
//
//     tasks.push(newTask);
//
//     res.status(201).json({
//         success: true,
//         data: { taskId: newTask.taskId, message: "Task created successfully." },
//         error: null
//     });
// };
//
// const updateTask = (req, res) => {
//     const id = parseInt(req.params.id);
//     const { title, status, priority } = req.body;
//
//     const taskIndex = tasks.findIndex(t => t.taskId === id);
//
//     if (taskIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: { code: "NOT_FOUND", message: "Task not found", details: {} }
//         });
//     }
//
//     tasks[taskIndex] = {
//         ...tasks[taskIndex],
//         title: title || tasks[taskIndex].title,
//         status: status || tasks[taskIndex].status,
//         priority: priority || tasks[taskIndex].priority
//     };
//
//     res.status(200).json({
//         success: true,
//         data: { taskId: id, message: "Task updated successfully." },
//         error: null
//     });
// };
//
// const deleteTask = (req, res) => {
//     const id = parseInt(req.params.id);
//     const taskIndex = tasks.findIndex(t => t.taskId === id);
//
//     if (taskIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: { code: "NOT_FOUND", message: "Task not found", details: {} }
//         });
//     }
//
//     tasks.splice(taskIndex, 1);
//
//     res.status(200).json({
//         success: true,
//         data: { taskId: id, message: "Task deleted successfully." },
//         error: null
//     });
// };
//
// module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };

const taskService = require('../services/taskService');

const getAllTasks = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'taskId';

        const result = taskService.getAllTasksLogic(page, limit, sortBy);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getTaskById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const task = taskService.getTaskByIdLogic(id);

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
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const createTask = (req, res) => {
    try {
        const newTask = taskService.createTaskLogic(req.body);

        res.status(201).json({
            success: true,
            data: { taskId: newTask.taskId, message: "Task created successfully." },
            error: null
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const updateTask = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        taskService.updateTaskLogic(id, req.body);

        res.status(200).json({
            success: true,
            data: { taskId: id, message: "Task updated successfully." },
            error: null
        });
    } catch (error) {
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task not found", details: {} }
            });
        }
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const deleteTask = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        taskService.deleteTaskLogic(id);

        res.status(200).json({
            success: true,
            data: { taskId: id, message: "Task deleted successfully." },
            error: null
        });
    } catch (error) {
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task not found", details: {} }
            });
        }
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };