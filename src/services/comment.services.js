const { omit, pick } = require('lodash');
const { NotFound } = require('../core/error.response');
const Comment = require('../models/comment.model');
const { findOneProduct } = require('../models/repositories/product.repo');

class CommentService {
  static async createComment({ comment_text, productId, userId, comment_parent = null }) {
    const product = await findOneProduct({ product_id: productId });
    if (!product) {
      throw new NotFound('Product not found');
    }
    const newComment = new Comment({
      comment_text,
      comment_productId: productId,
      comment_userId: userId,
      comment_parent
    });
    let rightValue = 0;
    let levelValue = 0;
    if (comment_parent) {
      const commentParentDoc = await Comment.findById(comment_parent).lean();
      if (!commentParentDoc) {
        throw new NotFound('Comment Parent not found');
      }
      rightValue = commentParentDoc.comment_right;
      levelValue = commentParentDoc.comment_level + 1;
      //Cập nhật right left comment
      await Comment.updateMany(
        { comment_productId: productId, comment_right: { $gte: rightValue } },
        { $inc: { comment_right: 2 } }
      );
      await Comment.updateMany(
        { comment_productId: productId, comment_left: { $gt: rightValue } },
        { $inc: { comment_left: 2 } }
      );
    } else {
      const commentMaxRight = await Comment.findOne({ comment_productId: productId })
        .sort({ comment_right: -1 })
        .select('comment_right');
      rightValue = commentMaxRight ? commentMaxRight.comment_right + 1 : 1;
    }
    newComment.comment_left = rightValue;
    newComment.comment_right = rightValue + 1;
    newComment.comment_level = levelValue;
    const comment = await newComment.save();
    return comment;
  }
  static async getComments({ productId, page = 1, limit = 20, parentCommentId = null, levelStart = 1, levelEnd = 8 }) {
    const product = await findOneProduct({ product_id: productId });
    if (!product) {
      throw new NotFound('Product not found');
    }
    if (parentCommentId) {
      const commentParentDoc = await Comment.findById(parentCommentId).lean();
      if (!commentParentDoc) {
        throw new NotFound('Comment Parent not found');
      }
      const comments = await Comment.find({
        comment_productId: productId,
        comment_level: { $gte: levelStart, $lte: levelEnd },
        comment_left: { $gt: commentParentDoc.comment_left },
        comment_right: { $lt: commentParentDoc.comment_right }
      })
        .sort({ comment_level: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v -comment_productId');
      const commentsConfig = await Promise.all(
        comments.map(async (comment) => {
          const count = await Comment.countDocuments({
            comment_productId: productId,
            comment_left: { $gt: comment.comment_left },
            comment_right: { $lt: comment.comment_right }
          });
          const commentOmit = pick(comment._doc, [
            'comment_text',
            'comment_userId',
            'comment_parent',
            'comment_level',
            'createdAt',
            '_id'
          ]);
          return { ...commentOmit, countChildComment: count };
        })
      );
      return { comments: commentsConfig };
    } else {
      const comments = await Comment.find({ comment_productId: productId, comment_parent: parentCommentId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v -comment_productId');
      const commentsConfig = await Promise.all(
        comments.map(async (comment) => {
          const count = await Comment.countDocuments({
            comment_productId: productId,
            comment_left: { $gt: comment.comment_left },
            comment_right: { $lt: comment.comment_right }
          });
          const commentOmit = pick(comment._doc, [
            'comment_text',
            'comment_userId',
            'comment_parent',
            'comment_level',
            'createdAt',
            '_id'
          ]);
          return { ...commentOmit, countChildComment: count };
        })
      );

      return { comments: commentsConfig };
    }
  }
  static async deleteComment({ commentId, productId }) {
    const product = await findOneProduct({ product_id: productId });
    if (!product) {
      throw new NotFound('Product not found');
    }
    const comment = await Comment.findById(commentId).lean();
    if (!comment) {
      throw new NotFound('Comment not found');
    }
    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    const width = rightValue - leftValue + 1;
    await Comment.deleteMany({ comment_productId: productId, comment_left: { $gte: leftValue, $lte: rightValue } });
    await Comment.updateMany(
      { comment_productId: productId, comment_right: { $gt: rightValue } },
      { $inc: { comment_right: -width } }
    );
    await Comment.updateMany(
      { comment_productId: productId, comment_left: { $gt: rightValue } },
      { $inc: { comment_left: -width } }
    );
    return true;
  }
}

module.exports = CommentService;
