"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    new successResponse({
      message: "Create new discount successfully!",
      metadata: await DiscountService.createDiscountCode({ ...req.body, shopId: req.user.userId }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    new successResponse({
      message: "getAllDiscountCodes successfully!",
      metadata: await DiscountService.getAllDiscountCodesByShop({ ...req.query, shopId: req.user.userId }),
    }).send(res);
  };

  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new successResponse({
      message: "getAllDiscountCodesWithProducts successfully!",
      metadata: await DiscountService.getAllDiscountCodeWithProduct({ ...req.query }),
    }).send(res);
  };

  getAllDiscountAmount = async (req, res, next) => {
    new successResponse({
      message: "getDiscountAmount successfully!",
      metadata: await DiscountService.getDiscountAmount({ ...req.body }),
    }).send(res);
  };
}

module.exports = new DiscountController();
