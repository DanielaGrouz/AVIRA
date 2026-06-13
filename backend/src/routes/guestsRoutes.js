const express = require('express');
const router = express.Router();
const {validateId} = require('../middleware/validation');
const {authorize, validateEventId} = require("../middleware/auth");
const {validateGuestFields} = require("../middleware/validation");
const eventController = require("../controllers/eventController");

router.get('/:id/guests', authorize(['user', 'admin']), validateId, validateEventId, eventController.getAllGuestsByEvent);
router.post('/:id/guests', authorize(['user', 'admin']), validateId, validateEventId, validateGuestFields, eventController.addGuestToEvent);
router.delete('/:id/guests/:guestId', authorize(['user', 'admin']), validateId, validateEventId, eventController.removeGuestFromEvent);
router.put('/:id/guests/:guestId', authorize(['user', 'admin']), validateId, validateEventId, validateGuestFields, eventController.updateGuestInEvent);
router.patch('/guests/rsvp', eventController.updateGuestRSVP);
router.get('/guests/rsvp/:token', eventController.getGuestRSVPData);

module.exports = router;