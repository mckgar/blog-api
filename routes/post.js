const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.get_all_posts);
router.post('/', postController.create_post);

router.get('/:postid', postController.get_post);
router.put('/:postid', postController.update_post);
router.delete('/:postid', postController.delete_post);

module.exports = router;
