"use strict";

const express = require("express");
const inventoryController = require("../../controllers/inventory.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtil");
const router = express.Router();

router.use(authenticationV2);
router.post("/", asyncHandler(inventoryController.addStockToInventory));

module.exports = router;
