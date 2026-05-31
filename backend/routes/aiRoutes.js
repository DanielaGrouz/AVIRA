const express = require('express');

const router = express.Router();

const {authorize, validateEventId} = require("../middleware/auth");
const {validateId} = require("../middleware/validation");

const eventController = require("../controllers/eventController");

router.get('/:id/generate-invite', authorize(['user', 'admin']), validateId, validateEventId, eventController.generateInvite);
router.get('/:id/shopping-list', authorize(['user', 'admin']), validateId, validateEventId, eventController.generateShoppingList);
router.get('/:id/task-list', authorize(['user', 'admin']),validateId, validateEventId, eventController.generateTaskList);
router.get('/:id/find-stores', authorize(['user', 'admin']), validateId, validateEventId, eventController.findStores);

module.exports = router;