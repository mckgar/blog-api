const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const PostSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 256
    },
    content: {
      type: String,
      required: true,
      maxLength: 10000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date_created: {
      type: Date,
      default: Date.now,
    },
    date_edited: {
      type: Date,
    },
    published: {
      type: Boolean,
      required: true,
    }
  }
);

PostSchema.virtual('dateCreatedFormatted').get(function() {
  return DateTime.fromJSDate(this.date_created).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model('Post', PostSchema);
