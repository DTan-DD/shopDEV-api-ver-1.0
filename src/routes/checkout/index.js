"use strict";

const express = require("express");
const checkoutController = require("../../controllers/checkout.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

// get amount a discount
router.post("/review", asyncHandler(checkoutController.checkoutReview));

// authentication
// router.use(authenticationV2);

module.exports = router;
