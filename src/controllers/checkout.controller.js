"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    new successResponse({
      message: "checkoutReview successfully!",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  };

  //   getAllDiscountCodes = async (req, res, next) => {
  //     new successResponse({
  //       message: "getAllDiscountCodes successfully!",
  //       metadata: await CheckoutService.getAllDiscountCodesByShop({ ...req.query, shopId: req.user.userId }),
  //     }).send(res);
  //   };

  //   getAllDiscountCodesWithProducts = async (req, res, next) => {
  //     new successResponse({
  //       message: "getAllDiscountCodesWithProducts successfully!",
  //       metadata: await CheckoutService.getAllDiscountCodeWithProduct({ ...req.query }),
  //     }).send(res);
  //   };

  //   getAllDiscountAmount = async (req, res, next) => {
  //     new successResponse({
  //       message: "getDiscountAmount successfully!",
  //       metadata: await CheckoutService.getDiscountAmount({ ...req.body }),
  //     }).send(res);
  //   };
}

module.exports = new CheckoutController();
