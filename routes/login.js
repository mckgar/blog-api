const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/', [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .escape(),
  body('password')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        {
          errors: errors.array(),
          username: req.body.username,
        }
      )
    }
    try {
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if (isValid) {
          const opts = {};
          opts.expiresIn = 600;
          const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, opts);
          return res.status(200).json(
            {
              message: 'Login Successful',
              token
            }
          );
        }
      }
      return res.status(401).json(
        {
          message: 'Username or password is incorrect'
        }
      )
    } catch (err) {
      next(err);
    }
  }
]);

module.exports = router;
