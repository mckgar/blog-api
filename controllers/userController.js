const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const passport = require('passport');
require('../passport');

exports.get_all_users = async (req, res, next) => {
  try {
    const allUsers = await User.find().select({ _id: 0, 'username': 1, 'role': 1 });
    return res.status(200).json(
      {
        users: allUsers,
      }
    )
  } catch (err) {
    next(err);
  }
}

exports.create_user = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Username is required')
    .custom(async value => {
      try {
        const search = await User.find({ username: value });
        if (search.length > 0) {
          return Promise.reject('Username already in use');
        }
      } catch (err) {
        console.log(err);
        return Promise.reject('An error has occured');
      }
    }),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be length 8 or more')
    .escape(),
  body('confirm-password')
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject('Passwords do no match');
      }
      return true;
    }),
  body('email')
    .trim()
    .isEmail()
    .escape(),
  body('first_name')
    .trim()
    .escape(),
  body('surname')
    .trim()
    .escape(),
  async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(400).json({
        errors: error.array(),
        username: req.body.username,
        email: req.body.email,
        first_name: req.body.first_name,
        surname: req.body.surname
      })
    } else {
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User(
          {
            username: req.body.username,
            password: hashedPassword,
          }
        );
        if (req.body.email) user.email = req.body.email;
        if (req.body.surname) user.surname = req.body.surname;
        if (req.body.first_name) user.first_name = req.body.first_name;
        await user.save();
        const newUser = await User.findOne({ username: req.body.username });
        const opts = {};
        opts.expiresIn = 600;
        const token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET, opts);
        res.status(201).json(
          {
            message: 'New user successfully created!',
            token,
          }
        )
      } catch (err) {
        next(err);
      }
    }
  }
];

exports.get_user = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.userid });
    if (user) {
      const { _id, password, email, __v, ...userInfo } = user.toJSON();
      const posts = await Post.find({ author: user._id });
      const comments = await Comment.find({ author: user._id }).populate('Post');
      return res.status(200).json(
        {
          user: userInfo,
          posts,
          comments
        }
      )
    } else {
      return res.status(400).json(
        {
          message: 'User not found'
        }
      )
    }
  } catch (err) {
    next(err);
  }
}

exports.update_user = [
  passport.authenticate('jwt', { session: false }),
  body('username')
    .trim()
    .escape()
    .custom(async value => {
      try {
        const search = await User.find({ username: value });
        if (search.length > 0) {
          return Promise.reject('Username already in use');
        }
      } catch (err) {
        console.log(err);
        return Promise.reject('An error has occured');
      }
    })
    .optional({ nullable: true }),
  body('password')
    .trim()
    .escape()
    .custom(value => {
      if (value.length < 8) {
        return Promise.reject('New password must be length 8 or more');
      }
    })
    .optional({ nullable: true }),
  body('email')
    .trim()
    .isEmail()
    .escape()
    .optional({ nullable: true }),
  body('first_name')
    .trim()
    .escape()
    .optional({ nullable: true }),
  body('surname')
    .trim()
    .escape()
    .optional({ nullable: true }),
  async (req, res, next) => {
    if (req.params.userid !== req.user.username) {
      return res.status(403).json(
        {
          message: 'Not authorized'
        }
      );
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array()
        }
      )
    }
    try {
      const updates = {};
      if (req.body.username) updates.username = req.body.username;
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updates.password = hashedPassword;
      }
      if (req.body.email) updates.email = req.body.email;
      if (req.body.first_name) updates.first_name = req.body.first_name;
      if (req.body.surname) updates.surname = req.body.surname;
      await User.findOneAndUpdate({ username: req.params.userid }, updates)
      return res.status(200).json(
        {
          message: 'User updated successful'
        }
      )
    } catch (err) {
      next(err);
    }
  }
]

exports.delete_user = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    if (req.params.userid !== req.user.username) {
      return res.status(403).json(
        {
          message: 'Not authorized'
        }
      );
    } else {
      try {
        await User.deleteOne({ username: req.user.username });
        return res.status(200).json(
          {
            message: 'User deleted'
          }
        );
      } catch (err) {
        next(err);
      }
    }
  }
]
