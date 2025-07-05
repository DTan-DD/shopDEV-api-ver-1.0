"use strict";

const express = require("express");
const cartController = require("../../controllers/cart.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

// get amount a discount
router.post("/", asyncHandler(cartController.addToCart));
router.post("/update", asyncHandler(cartController.update));
router.delete("/", asyncHandler(cartController.delete));
router.get("/", asyncHandler(cartController.listToCart));

// authentication
// router.use(authenticationV2);

module.exports = router;
