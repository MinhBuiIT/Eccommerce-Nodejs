const { CreatedResponse, OKResponse } = require('../core/success.response');
const CommentService = require('../services/comment.services');

class CommentController {
  async createComment(req, res) {
    const { comment_text, productId, userId, comment_parent } = req.body;
    const comment = await CommentService.createComment({ comment_text, productId, userId, comment_parent });
    new CreatedResponse({ message: 'Comment created', metadata: comment }).send(res);
  }
  async getComments(req, res) {
    const { productId, parentCommentId, page, limit, levelStart, levelEnd } = req.query;
    const { comments } = await CommentService.getComments({
      productId,
      parentCommentId,
      page,
      limit,
      levelStart,
      levelEnd
    });
    new OKResponse({ message: 'get list comment', metadata: comments }).send(res);
  }
  async deleteComment(req, res) {
    const { productId, commentId } = req.body;
    const comment = await CommentService.deleteComment({ commentId, productId });
    new OKResponse({ message: 'Comment deleted', metadata: comment }).send(res);
  }
}
module.exports = new CommentController();
