const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const {authorize, validateEventId} = require("../middleware/auth");
const {upload} = require("../middleware/fileUpload");
const validate = require('../middleware/validation');
const {
    idSchema,
    eventSchema,
    optionalEventSchema,
    tokenParamSchema,
    eventPaginationSchema
} = require('../middleware/schemas');
const {VALID_ROLES} = require("../../models/constants");

router.get(
    '/',
    authorize(VALID_ROLES),
    validate(eventPaginationSchema, 'query'),
    eventController.getAllEvents
);
router.get('/:id', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.getEventById);
router.post('/', authorize(VALID_ROLES), validate(eventSchema, 'body'), eventController.createEvent);
router.put('/:id', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, validate(optionalEventSchema, 'body'), eventController.updateEvent);
router.delete('/:id', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.deleteEvent);
router.get('/:id/gallery', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, eventController.getEventGallery);

router.post('/gallery/:token', validate(tokenParamSchema, 'params'), upload.single('picture'), eventController.uploadToEventGallery);
router.put('/:id/save-invitation', authorize(VALID_ROLES), validate(idSchema, 'params'), validateEventId, upload.single('picture'), eventController.saveInvitation);

module.exports = router;