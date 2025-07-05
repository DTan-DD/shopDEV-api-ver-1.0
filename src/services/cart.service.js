"use strict";

const { update } = require("lodash");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
const { NotFoundError } = require("../core/error.response");

/**
 * Key features: Cart service
 * 1 - Add product to cart [User]
 * 2 - Reduce product quantity in cart [User]
 * 3 - increase product quantity in cart [User]
 * 4 - Get cart by userId [User]
 * 5 - Delete cart [User]
 * 6 - Delete product in cart [User]
 */

class CartService {
  // START REPO CART
  static async createUserCart({ userId, product }) {
    console.log("1", product);

    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = { cart_userId: userId, "cart_products.productId": productId, cart_state: "active" },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateSet, options);
  }
  // END REPO CART

  static async addToCart({ userId, product = {} }) {
    // check cart ton tai hay khong?
    console.log(userId);
    console.log(product.quantity);
    const foundProduct = await getProductById(product.productId);
    if (!foundProduct) throw new NotFoundError("Not Found Product!");
    const { product_name, product_price, product_quantity } = foundProduct;
    let addProduct = { ...product, product_name, product_price };
    const userCart = await cart.findOne({ cart_userId: userId });
    console.log(userCart);

    if (!userCart) {
      // create cart for user
      return await CartService.createUserCart({ userId, product: addProduct });
    }

    // neu co gio hang roi nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [addProduct];
      return await userCart.save();
    }

    const index = userCart.cart_products.findIndex((item) => item.productId === foundProduct._id.toHexString());
    // gio hang ton tai roi va co san pham nay thi update quantity
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId: foundProduct._id.toHexString(),
        quantity: product.quantity - userCart.cart_products[index].quantity,
      },
    });
  }

  //   update cart
  /**
   * shop_order_ids:[
   * {shopId, item_products: [{
   *    quantity, price, shopId, old_quantity, productId
   *    }],
   *    version
   * }]
   */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Not Found Product!");
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Product do not belong to the shop");
    }

    if (quantity === 0) {
      // deleted
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cart.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({ cart_userId: +userId }).lean();
  }
}

module.exports = CartService;
