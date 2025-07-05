"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const InventoryService = require("../services/inventory.service");

class InvenoryController {
  addStockToInventory = async (req, res, next) => {
    // new
    new successResponse({
      message: "addStockToInventory success",
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res);
  };
}

module.exports = new InvenoryController();
