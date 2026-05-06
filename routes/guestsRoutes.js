const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { validateId, validateEventId} = require('../middleware/validation');
const authorize = require("../middleware/auth");
const {validateGuestFields} = require("../middleware/validation");

router.get('/', authorize(['admin']), guestController.getAllGuests);
router.get('/:id', validateId, guestController.getGuestById);
router.post('/', validateEventId, validateGuestFields, guestController.createGuest);
router.put('/:id', validateId, validateGuestFields, guestController.updateGuest);
router.delete('/:id', validateId, guestController.deleteGuest);

module.exports = router;