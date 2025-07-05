"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    order_userId: { type: Number, require: true },
    order_checkout: { type: Object, default: {} },
    /**
     * order_checkout = {totalPrice, totalApplyDiscount, feeShip}
     */
    order_shipping: { type: Object, default: {} },
    /**
     * order_shipping = {street, city, state, country}
     */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, require: true },
    order_trackingNumber: { type: String, default: "#0000106052025" }, // di voi nhan van chuyen
    order_status: { type: String, enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"], default: "pending" },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createOn",
      updatedAt: "modifiedOn",
    },
  }
);

module.exports = { order: model(DOCUMENT_NAME, orderSchema) };
