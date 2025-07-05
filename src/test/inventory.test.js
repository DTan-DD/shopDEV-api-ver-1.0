const redisPublishService = require("../services/redisPublish.service");

class InventoryServiceTest {
  constructor() {
    redisPublishService.subscribe("purchase_events", (channel, message) => {
      console.log(`Received message ${message}`);
      InventoryServiceTest.updateInventory(message);
    });
  }

  static updateInventory(data) {
    const dataObj = JSON.parse(data);
    console.log(`Update inventory ${dataObj.productId} with quantity ${dataObj.quantity}`);
  }
}

module.exports = new InventoryServiceTest();
