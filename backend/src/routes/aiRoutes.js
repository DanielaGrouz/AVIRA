const express = require('express');
const router = express.Router();
const { authorize, validateEventId } = require("../middleware/auth");
const eventController = require("../controllers/eventController");

const validate = require('../middleware/validation');
const { idSchema, locationQuerySchema } = require('../middleware/schemas');
const {VALID_ROLES} = require("../../models/constants");

router.get('/:id/generate-invite', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.generateInvite);
router.get('/:id/shopping-list', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.generateShoppingList);
router.get('/:id/task-list', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.generateTaskList);

// Add query validation to ensure lat and lon are provided correctly before hitting the controller
router.get('/:id/find-stores', authorize(VALID_ROLES), validate(idSchema, 'params'), validate(locationQuerySchema, 'query'), validateEventId, eventController.findStores);

module.exports = router;