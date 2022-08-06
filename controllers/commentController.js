const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const Comment = require('../models/comment');

const passport = require('passport');
require('../passport');

exports.create_comment = [
  passport.authenticate('jwt', { session: false }),
  body('content')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Content is required')
    .isLength({ max: 1024 })
    .withMessage('Content cannot exceed 1024 characters'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array(),
          content: req.body.content
        }
      );
    }
    try {
      const post = await Post.findOne({ _id: req.params.postid });
      if (post) {
        const comment = new Comment(
          {
            content: req.body.content,
            post: post._id,
            author: req.user._id
          }
        );
        await comment.save();
        res.status(201).json(
          {
            message: 'New comment successfully created'
          }
        )
      } else {
        return res.status(400).json(
          {
            message: 'Post not found'
          }
        )
      }
    } catch (err) {
      next(err);
    }
  }
];

exports.update_comment = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({ _id: req.params.commentid });
      if (comment) {
        if (req.user._id !== comment.author && req.user.role !== 'admin') {
          return res.status(403).json(
            {
              message: 'Unauthorized: You don\'t have permission to do that'
            }
          )
        }
      } else {
        return res.status(400).json(
          {
            message: 'Comment not found'
          }
        )
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  body('content')
    .trim()
    .escape()
    .isLength({ min: 1, max: 1024 })
    .withMessage('Comment content must be 1-1024 characters in length'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array(),
          content: content
        }
      );
    }
    try {
      const updates = {
        content: req.body.content,
        date_edited: Date.now()
      };
      await Comment.updateOne({ _id: req.params.commentid }, updates);
      res.status(200).json(
        {
          message: 'Comment successfully updated'
        }
      );
    } catch (err) {
      next(err);
    }
  }
];

exports.delete_comment = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({ _id: req.params.commentid });
      if (comment) {
        if (req.user._id !== comment.author && req.user.role !== 'admin') {
          return res.status(403).json(
            {
              message: 'Unauthorized: You don\'t have permission to do that'
            }
          )
        } else {
          await Comment.deleteOne({ _id: req.params.commentid });
          return res.status(200).json(
            {
              message: 'Comment deleted'
            }
          );
        }
      } else {
        return res.status(400).json(
          {
            message: 'Comment not found'
          }
        );
      }
    } catch (err) {
      next(err);
    }
  }
];
