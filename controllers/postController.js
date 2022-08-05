const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const Comment = require('../models/comment');

const passport = require('passport');
require('../passport');

exports.get_all_posts = async (req, res, next) => {
  try {
    const allPublishedPosts = await Post.find({ published: true })
      .select({ title: 1, author: 1 })
      .populate('author', [ 'username', 'first_name', 'surname' ]);
    return res.status(200).json(
      {
        posts: allPublishedPosts
      }
    )
  } catch (err) {
    next(err);
  }
};

exports.create_post = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    if (req.user.role === 'member') {
      return res.status(403).json(
        {
          message: 'Unauthorized: Only bloggers can post'
        }
      )
    }
    next();
  },
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required')
    .isLength({ max: 265 })
    .withMessage('Title must not exceed 256 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Posts cannot be empty')
    .isLength({ max: 10000 })
    .withMessage('Post Content must not exceed 10000 characters')
    .escape(),
  body('published')
    .trim()
    .escape()
    .isBoolean()
    .withMessage('Published must be true or false'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array(),
          title: req.body.title,
          content: req.body.content,
          published: req.body.published
        }
      )
    }
    try {
      const post = new Post(
        {
          title: req.body.title,
          content: req.body.content,
          author: req.user._id,
          published: req.body.published
        }
      );
      await post.save();
      res.status(201).json(
        {
          message: 'New post successfully created'
        }
      );
    } catch (err) {
      next(err);
    }
  }
];

exports.get_post = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postid })
      .populate('author', [ 'username', 'first_name', 'surname' ]);
    if (post) {
      const comments = await Comment.find({ post: req.params.postid })
        .populate('author', [ 'username', 'first_name', 'surname' ]);
      return res.status(200).json(
        {
          post,
          comments
        }
      );
    } else {
      res.status(400).json(
        {
          message: 'Post not found'
        }
      )
    }
  } catch (err) {
    next(err)
  }
}

exports.update_post = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.find({ _id: req.params.postid });
      if (post) {
        if (req.user._id !== post.author && req.user.role !== 'admin') {
          return res.status(403).json(
            {
              message: 'Unauthorized'
            }
          );
        }
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
    next();
  },
  body('title')
    .trim()
    .escape()
    .isLength({ max: 265 })
    .withMessage('Title must not exceed 256 characters')
    .optional({ nullable: true }),
  body('content')
    .trim()
    .escape()
    .isLength({ max: 10000 })
    .withMessage('Post Content must not exceed 10000 characters')
    .optional({ nullable: true }),
  body('published')
    .trim()
    .escape()
    .isBoolean()
    .withMessage('Published must be true or false')
    .optional({ nullable: true }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array(),
          title: req.body.title,
          content: req.body.content,
          published: req.body.published
        }
      )
    }
    try {
      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.content) updates.content = req.body.content;
      if (req.body.published) updates.published = rq.body.published; 
      if (Object.keys(updates).length > 0) {
        updates.date_edited = Date.now();
        await Post.updateOne({ _id: req.params.postid }, updates);
        res.status(200).json(
          {
            message: 'Post successfully updated'
          }
        )
      }  else {
        return res.status(400).json(
          {
            message: 'No update data received'
          }
        )
      }
    } catch (err) {
      next(err);
    }
  },
];

exports.delete_post = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.find({ _id: req.params.postid });
      if (post) {
        if (req.user._id !== post.author && req.user.role !== 'admin') {
          return res.status(403).json(
            {
              message: 'Unauthorized: You don\'t have permission to do that'
            }
          );
        } else {
          await Post.deleteOne({ _id: req.params.postid });
          return res.status(200).json(
            {
              message: 'Post deleted'
            }
          )
        }
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
  },
]
