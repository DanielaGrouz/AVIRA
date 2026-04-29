const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // import user logic
const authorize = require('../middleware/auth');
const { validateId, validateUserFields } = require('../middleware/validation');


router.get('/', userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.post('/', validateUserFields, userController.createUser);
//router.post('/', authorize(['admin']), validateUserFields, userController.createUser);
router.put('/:id', validateId, validateUserFields, userController.updateUser);
//router.put('/:id', validateId, authorize(['admin']), validateUserFields, userController.updateUser);
router.delete('/:id', validateId, userController.deleteUser);
//router.delete('/:id', validateId, authorize(['admin']), userController.deleteUser);

module.exports = router;