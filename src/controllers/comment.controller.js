"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new successResponse({
      message: "Create new comment success",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new successResponse({
      message: "getCommentsByParentId success",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new successResponse({
      message: "deleteComment success",
      metadata: await CommentService.deleteComments(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
