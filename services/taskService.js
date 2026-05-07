let tasks = require('../models/taskModel');

const getAllTasksLogic = (page = 1, limit = 5, sortBy = 'taskId') => {
    let sortedTasks = [...tasks].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

    return {
        page: page,
        totalPages: Math.ceil(tasks.length / limit),
        data: paginatedTasks
    };
};

const getTaskByIdLogic = (id) => {
    return tasks.find(t => t.taskId === id) || null;
};

const createTaskLogic = (taskData) => {
    const { eventId, title, status, priority } = taskData;

    const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskId)) + 1 : 1;

    const newTask = {
        taskId: newTaskId,
        eventId,
        title,
        status: status || "pending",
        priority: priority || "medium"
    };

    tasks.push(newTask);
    return newTask;
};

const updateTaskLogic = (id, updateData) => {
    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        throw new Error("TASK_NOT_FOUND");
    }

    const { title, status, priority } = updateData;

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title || tasks[taskIndex].title,
        status: status || tasks[taskIndex].status,
        priority: priority || tasks[taskIndex].priority
    };

    return tasks[taskIndex];
};

const deleteTaskLogic = (id) => {
    const taskIndex = tasks.findIndex(t => t.taskId === id);

    if (taskIndex === -1) {
        throw new Error("TASK_NOT_FOUND");
    }

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