"use strict";

const { create } = require("lodash");
const notificationModel = require("../models/notification.model");

const pushNotiToSystem = async ({ type = "SHOP-001", receivedId = 1, senderId = 1, options = 1 }) => {
  let noti_content;

  if (type === "SHOP-001") {
    noti_content = `Shop XYZ vua moi them san pham moi: abc`;
  } else if (type === "PROMOTION-001") {
    noti_content = `Shop XYZ vua moi them voucher moi: abc`;
  }

  const newNoti = await notificationModel.create({
    noti_type: type,
    noti_content,
    noti_senderId: senderId,
    noti_receivedId: receivedId,
    noti_options: options,
  });

  return newNoti;
};

const listNotiByUser = async ({ userId = 1, type = "ALL", isRead = 0 }) => {
  const match = { noti_receivedId: userId };
  if (type !== "ALL") {
    match["noti_type"] = type;
  }

  return await notificationModel.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        noti_type: 1,
        noti_senderId: 1,
        noti_receivedId: 1,
        noti_content: {
          $concat: [
            {
              $substr: ["$noti_options.shop_name", 0, -1],
            },
            " vừa mới thêm một sản phẩm mới: ",
            {
              $substr: ["$noti_options.product_name", 0, -1],
            },
          ],
        },
        createAt: 1,
        noti_options: 1,
      },
    },
  ]);
};

module.exports = { pushNotiToSystem, listNotiByUser };
