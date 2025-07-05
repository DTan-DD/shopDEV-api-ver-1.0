const { product } = require("../models/product.model");
const redisPublishService = require("../services/redisPublish.service");

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
    console.log("productId", productId);
    redisPublishService.publish("purchase_events", JSON.stringify(order));
  }
}

module.exports = new ProductServiceTest();
