"use strict";
const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication, authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

router.post("/shop/signup", asyncHandler(accessController.sighUp));
router.post("/shop/login", asyncHandler(accessController.login));

// authentication
router.use(authenticationV2);
//
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post("/shop/handlerRefreshToken", asyncHandler(accessController.handlerRefreshToken));

module.exports = router;
