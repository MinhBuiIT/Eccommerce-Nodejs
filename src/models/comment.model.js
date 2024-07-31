'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Comment';
const COLLECTION_NAME = 'comments';
const commentSchema = new Schema(
  {
    comment_productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    comment_userId: {
      type: String,
      required: true
    },
    comment_text: {
      type: String,
      required: true
    },
    comment_left: {
      type: Number,
      required: true
    },
    comment_right: {
      type: Number,
      required: true
    },
    comment_level: {
      type: Number,
      required: true
    },
    comment_parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const Comment = model(DOCUMENT_NAME, commentSchema);
module.exports = Comment;
