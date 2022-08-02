const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.get_all_users);
router.post('/', userController.create_user);

router.get('/:userid', userController.get_user);
router.put('/:userid', userController.update_user);
router.delete('/:userid', userController.delete_user);

module.exports = router;
