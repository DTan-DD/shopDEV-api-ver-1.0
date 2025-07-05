"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const { listNotiByUser } = require("../services/notification.service");

class NotificationController {
  listNotiByUser = async (req, res, next) => {
    new successResponse({
      message: "listNotiByUser success",
      metadata: await listNotiByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
