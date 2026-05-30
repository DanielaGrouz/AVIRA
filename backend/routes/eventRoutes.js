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

// Sub-resources (Guests and Tasks for a specific event)
// Changed to /:id/guests to avoid collision with getEventById
router.get('/:id/guests', authorize(['user', 'admin']), validateId, validateEventId, eventController.getAllGuestsByEvent);
router.post('/:id/guests', authorize(['user', 'admin']), validateId, validateEventId, validateGuestFields, eventController.addGuestToEvent);
router.delete('/:id/guests/:guestId', authorize(['user', 'admin']), validateId, validateEventId, eventController.removeGuestFromEvent);
router.put('/:id/guests/:guestId', authorize(['user', 'admin']), validateId, validateEventId, validateGuestFields, eventController.updateGuestInEvent);
router.patch('/:id/guests/:guestId/rsvp', authorize(['user', 'admin']), validateId, validateEventId, eventController.confirmGuestAttendance);
router.get('/:id/tasks', authorize(['user', 'admin']), validateId, validateEventId, eventController.getTasksByEventId);
router.post('/:id/tasks', authorize(['user', 'admin']), validateId, validateEventId, eventController.addTaskToEvent);
router.put('/:id/tasks/:taskId', authorize(['user', 'admin']), validateId, validateEventId, eventController.updateTaskInEvent);
router.delete('/:id/tasks/:taskId', authorize(['user', 'admin']), validateId, validateEventId, eventController.removeTaskFromEvent);

router.get('/:id/generate-invite', authorize(['user', 'admin']), validateId, validateEventId, eventController.generateInvite);
router.get('/:id/shopping-list', authorize(['user', 'admin']), validateId, validateEventId, eventController.generateShoppingList);
router.get('/:id/task-list', authorize(['user', 'admin']),validateId, validateEventId, eventController.generateTaskList);
router.get('/:id/find-stores', authorize(['user', 'admin']), validateId, validateEventId, eventController.findStores);
router.put('/:id/save-invitation', authorize(['user', 'admin']), upload.single('picture'), validateId, validateEventId, eventController.saveInvitation);

module.exports = router;