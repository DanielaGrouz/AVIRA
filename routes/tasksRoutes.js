const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController'); // Import task logic
const authorize = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Get all tasks in the system from all events (Admin Only)
router.get('/', authorize(['admin']), taskController.getAllTasks);

// Get all tasks for a specific event
router.get('/event/:eventId', taskController.getTasksByEventId);

// Get a specific task by its ID
router.get('/:id', validateId, taskController.getTaskById);

// Create a new task
router.post('/', taskController.createTask);

// Update an existing task
router.put('/:id', validateId, taskController.updateTask);

// Delete a task
router.delete('/:id', validateId, taskController.deleteTask);

module.exports = router;