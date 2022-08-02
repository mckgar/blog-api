const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.get_all_users = async (req, res, next) => {
  return res.status(200).json(
    {
      message: 'test',
    }
  )
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
          opts.expiresIn = 120;
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
  return res.status(200).json(
    {
      message: 'test',
    }
  )
}

exports.update_user = async (req, res, next) => {
  return res.status(200).json(
    {
      message: 'test',
    }
  )
}

exports.delete_user = async (req, res, next) => {
  return res.status(200).json(
    {
      message: 'test',
    }
  )
}
