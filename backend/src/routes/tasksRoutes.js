const express = require('express');
const router = express.Router();
const { authorize, validateEventId } = require('../middleware/auth');
const eventController = require('../controllers/eventController');
const validate = require('../middleware/validation');
const {
  idSchema,
  idAndTaskIdSchema,
  taskSchema,
  optionalTaskSchema,
  taskPaginationSchema,
} = require('../middleware/schemas');
const { VALID_ROLES } = require('../../models/constants');

router.get(
  '/:id/tasks',
  authorize(VALID_ROLES),
  validate(idSchema, 'params'),
  validate(taskPaginationSchema, 'query'),
  validateEventId,
  eventController.getTasksByEventId
);
router.post(
  '/:id/tasks',
  authorize(VALID_ROLES),
  validate(idSchema, 'params'),
  validateEventId,
  validate(taskSchema, 'body'),
  eventController.addTaskToEvent
);
router.put(
  '/:id/tasks/:taskId',
  authorize(VALID_ROLES),
  validate(idAndTaskIdSchema, 'params'),
  validateEventId,
  validate(optionalTaskSchema, 'body'),
  eventController.updateTaskInEvent
);
router.delete(
  '/:id/tasks/:taskId',
  authorize(VALID_ROLES),
  validate(idAndTaskIdSchema, 'params'),
  validateEventId,
  eventController.removeTaskFromEvent
);

module.exports = router;
