const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateId } = require('../middleware/validationMiddleware');
const authorize = require("../middleware/auth");
const userController = require("../controllers/userController");
const {validateUserFields} = require("../middleware/validation");

router.get('/', authorize(['admin']), eventController.getAllEvents);
router.get('/:id', validateId, userController.getEventById);
router.post('/', validateUserFields, userController.createEvent);
router.put('/:id', validateId, validateUserFields, userController.updateEvent);
router.delete('/:id', validateId, userController.deleteEvent);

module.exports = router;