const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/', postController.get_all_posts);
router.post('/', postController.create_post);

router.get('/:postid', postController.get_post);
router.put('/:postid', postController.update_post);
router.delete('/:postid', postController.delete_post);

router.post('/:postid/comment', commentController.create_comment);
router.put('/:postid/comment/:commentid', commentController.update_comment);
router.delete('/:postid/comment/:commentid', commentController.delete_comment);

module.exports = router;
