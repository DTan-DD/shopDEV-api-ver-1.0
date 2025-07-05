"use strict";

const express = require("express");
const notificationController = require("../../controllers/notification.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

// Not login

// Login
router.use(authenticationV2);
router.get("/", asyncHandler(notificationController.listNotiByUser));

module.exports = router;
