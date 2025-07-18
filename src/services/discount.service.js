"use strict";

const { max } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const { findAllDiscountCodesUnSelect, checkDiscountExists } = require("../models/repositories/discount.repo");
const { product } = require("../models/product.model");

/**
 * 1 - Generator Discount code (Shop | Admin)
 * 2 - Get discount amount (User)
 * 3 - Get all discount code (User | Shop)
 * 4 - Verify discount code (User)
 * 5 - Delete discount code (Admin | Shop)
 * 6 - Cancel discount code (User)
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const { code, start_date, end_date, value, user_used, is_active, shopId, min_order_value, product_ids, applies_to, description, name, type, max_value, max_uses, uses_count, max_uses_per_user } =
      payload;
    // kiem tra
    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError("Discount code has expried!");
    // }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start_date must be before end_date!");
    }

    // Create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount) {
      throw new BadRequestError("Discount code exists!");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_max_value: max_value,
      discount_code: code,
      discount_start_date: start_date,
      discount_end_date: new Date(end_date),
      discount_max_uses: new Date(max_uses),
      discount_uses_count: uses_count,
      discount_users_used: user_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscount() {}

  /**
   * Get all discount codes available with products
   */

  static async getAllDiscountCodeWithProduct({ code, shopId, userId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount code exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get all products
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /**
   * Get all discount codes available of shop
   */

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });

    return discounts;
  }

  /**
   * Apply discount code
   * products [{
   *    productId,
   *    shopId,
   *    quantity,
   *    name,
   *    price
   * }, ....]
   */

  static async getDiscountAmount({ code, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });
    console.log(foundDiscount);

    if (!foundDiscount) throw new NotFoundError("Discount doesn't exists");

    const {
      discount_is_active, //
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_type,
      discount_max_uses_per_user,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError("Discount expried!");
    if (!discount_max_uses) throw new NotFoundError("Discount are out!");

    // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
    //   throw new NotFoundError("Discount code is expried!");
    // }

    // check xem co dat gia tri toi thieu hay khong?
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}`);
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find((user) => user.userId === userId);
      if (userUsedDiscount) {
        // ...
      }
    }

    // check xem discount la fixed_mount
    const amount = discount_type === "fixed_amount" ? discount_value : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });
    return deleted;
  }

  /**
   * Cancel Discount code
   */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount doesn't exists");
    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_users_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
