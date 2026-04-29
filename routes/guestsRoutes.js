const express = require('express');
const router = express.Router();
const userController = require('../controllers/guestController');
const authorize = require('../middleware/auth');
const { validateId, validateUserFields } = require('../middleware/validation');


router.get('/', userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.post('/', authorize(['admin', 'manager']), validateUserFields, userController.createUser);
router.put('/:id', validateId, authorize(['admin', 'manager']), validateUserFields, userController.updateUser);
router.delete('/:id', validateId, authorize(['admin']), userController.deleteUser);


module.exports = router;