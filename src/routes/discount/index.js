"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

// get amount a discount
router.post("/amount", asyncHandler(discountController.getAllDiscountAmount));
router.get("/list_product_code", asyncHandler(discountController.getAllDiscountCodesWithProducts));

// authentication
router.use(authenticationV2);

router.post("/", asyncHandler(discountController.createDiscount));
router.get("/", asyncHandler(discountController.getAllDiscountCodes));
module.exports = router;
