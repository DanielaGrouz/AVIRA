const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const {
    validateId, validateEventFields, validateOptionalEventFields, validateGuestFields
} = require('../middleware/validation');
const {authorize, validateEventId} = require("../middleware/auth");
const {upload} = require("../middleware/fileUpload");

router.get('/', authorize(['user', 'admin']), eventController.getAllEvents);
router.get('/:id', authorize(['user', 'admin']), validateId, validateEventId, eventController.getEventById);
router.post('/', authorize(['user', 'admin']), validateEventFields, eventController.createEvent);
router.put('/:id', authorize(['user', 'admin']), validateId, validateEventId, validateOptionalEventFields, eventController.updateEvent);
router.delete('/:id', authorize(['user', 'admin']), validateId, validateEventId, eventController.deleteEvent);

router.put('/:id/save-invitation', authorize(['user', 'admin']), upload.single('picture'), validateId, validateEventId, eventController.saveInvitation);

module.exports = router;