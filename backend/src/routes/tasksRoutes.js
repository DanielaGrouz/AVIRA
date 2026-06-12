const express = require('express');
const router = express.Router();
const {authorize, validateEventId} = require('../middleware/auth');
const { validateId,} = require('../middleware/validation');
const eventController = require("../controllers/eventController");

router.get('/:id/tasks', authorize(['user', 'admin']), validateId, validateEventId, eventController.getTasksByEventId);
router.post('/:id/tasks', authorize(['user', 'admin']), validateId, validateEventId, eventController.addTaskToEvent);
router.put('/:id/tasks/:taskId', authorize(['user', 'admin']), validateId, validateEventId, eventController.updateTaskInEvent);
router.delete('/:id/tasks/:taskId', authorize(['user', 'admin']), validateId, validateEventId, eventController.removeTaskFromEvent);


module.exports = router;