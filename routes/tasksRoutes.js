const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController'); // Import task logic
const authorize = require('../middleware/auth');
const { validateId, validateEventId, validateTaskFields} = require('../middleware/validation');

router.get('/', authorize(['admin']), taskController.getAllTasks);
router.get('/:id', validateId, taskController.getTaskById);
router.post('/', validateEventId, validateTaskFields, taskController.createTask);
router.put('/:id', validateId, validateTaskFields, taskController.updateTask);
router.delete('/:id', validateId, taskController.deleteTask);

module.exports = router;