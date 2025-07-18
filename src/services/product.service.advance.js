"use strict";

const { extend } = require("lodash");
const { product, clothing, electronic, furniture } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByProduct,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");
const { pushNotiToSystem } = require("./notification.service");

// define Factory class to create product
class ProductFactory {
  /**
     type: "Clothing",
     payload
     */

  static productRegistry = {}; //key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  // PUT  //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }
  // END PUT  //
  // PUT  //

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // END PUT  //

  /// query ///
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByProduct({ keySearch });
  }

  static async findAllProducts({ limit = 50, sort = "ctime", page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({ limit, sort, filter, page, select: ["product_name", "product_price", "product_thumb", "product_shop"] });
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v", "product_variations"] });
  }
}

/**
 *   product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
      //   required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
 */

// define bass product class
class Product {
  constructor({ product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //   create new product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });
      //  push noti to system collection
      pushNotiToSystem({
        type: "SHOP-001",
        receivedId: 1,
        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((rs) => console.log(rs))
        .catch(console.error);
    }

    return newProduct;
  }

  // update Product
  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload: payload, model: product });
  }
}

// define sub-class for different product types Clothing
// define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({ ...this.product_attributes, product_shop: this.product_shop });
    if (!newClothing) {
      throw new BadRequestError("create new Clothing error!");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error!");
    }

    return newProduct;
  }

  async updateProduct(productId) {
    // 1. remove attr has null or undefined
    console.log("1", this);
    const objectParams = removeUndefinedObject(this);
    console.log("2", objectParams);

    // Tách product_attributes ra khỏi objectParams
    const { product_attributes, ...otherFields } = objectParams;

    // Update attributes riêng (nếu có)
    if (product_attributes) {
      await updateProductById({
        productId,
        // payload: { $set: updateNestedObjectParser({ product_attributes }) },
        payload: objectParams.product_attributes,
        model: clothing,
      });
    }

    // Update các field khác (nếu có)
    if (Object.keys(otherFields).length > 0) {
      return await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    }

    // Nếu chỉ update attributes, return kết quả từ DB
    return await product.findById(productId);
  }
}

// define sub-class for different product types Clothing
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({ ...this.product_attributes, product_shop: this.product_shop });
    if (!newFurniture) {
      throw new BadRequestError("create new Furniture error!");
    }

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error!");
    }

    return newProduct;
  }
}

// define sub-class for different product types Electronics
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({ ...this.product_attributes, product_shop: this.product_shop });
    if (!newElectronic) {
      throw new BadRequestError("create new Electronic error!");
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error!");
    }

    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);
// add more

module.exports = ProductFactory;
