"use strict";

const { CREATED, successResponse, OK } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.advance");

class ProductController {
  // createProduct = async (req, res, next) => {
  //   new successResponse({
  //     message: "Create new product successfully!",
  //     metadata: await ProductService.createProduct(req.body.product_type, { ...req.body, product_shop: req.user.userId }),
  //   }).send(res);
  // };
  createProduct = async (req, res, next) => {
    new successResponse({
      message: "Create new product successfully!",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, { ...req.body, product_shop: req.user.userId }),
    }).send(res);
  };

  // update Product
  updateProduct = async (req, res, next) => {
    new successResponse({
      message: "Update product successfully!",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId, //
        { ...req.body, product_shop: req.user.userId }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new successResponse({
      message: "publishProductByShop successfully!",
      metadata: await ProductServiceV2.publishProductByShop({ product_id: req.params.id, product_shop: req.user.userId }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new successResponse({
      message: "unPublishProductByShop successfully!",
      metadata: await ProductServiceV2.unPublishProductByShop({ product_id: req.params.id, product_shop: req.user.userId }),
    }).send(res);
  };

  //  QUERY //
  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new successResponse({
      message: "Get list Draft successfully!",
      metadata: await ProductServiceV2.findAllDraftsForShop({ product_shop: req.user.userId }),
    }).send(res);
    // END QUERY  //
  };

  getAllPublishForShop = async (req, res, next) => {
    new successResponse({
      message: "Get list Publish successfully!",
      metadata: await ProductServiceV2.findAllPublishForShop({ product_shop: req.user.userId }),
    }).send(res);
    // END QUERY  //
  };

  getListSearchProduct = async (req, res, next) => {
    new successResponse({
      message: "getListSearchProduct successfully!",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new successResponse({
      message: "Get list findAllProducts successfully!",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new successResponse({
      message: "Get findProduct successfully!",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
