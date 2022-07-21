const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      maxLength: 32,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    date_joined: {
      type: Date,
      default: Date.now,
    },
    first_name: {
      type: String,
      maxLength: 50
    },
    surname: {
      type: String,
      maxLength: 50,
    },
    role: {
      type: String,
      enum: ['member', 'blogger', 'admin'],
      default: 'member',
    }
  }
);

UserSchema.virtual('name').get(function() {
  return `${this.first_name} ${this.surname}`;
});

module.exports = mongoose.model('User', UserSchema);
