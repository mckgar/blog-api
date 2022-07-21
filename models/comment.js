const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxLength: 1024
    },
    date_created: {
      type: Date,
      default: Date.now,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  }
);

CommentSchema.virtual('dateCreatedFormatted').get(function() {
  return DateTime.fromJSDate(this.date_created).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model('Comment', CommentSchema);
