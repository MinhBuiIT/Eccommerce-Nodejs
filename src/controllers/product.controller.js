const { CreatedResponse, OKResponse } = require('../core/success.response');
const { ProductFactory } = require('../services/product.services');

class ProductController {
  async createProduct(req, res, next) {
    const { user_id } = req.user;
    const payload = { ...req.body, product_shop: user_id };
    const result = await ProductFactory.createProduct(req.body.product_type, payload);
    new CreatedResponse({ message: 'Product created successfully', metadata: result }).send(res);
  }
  /**
   * @desc Get all product draft
   * @returns {Array} product
   * @param {*} user_id
   * @param {*} limit
   * @param {*} skip
   */
  async getProductDraftAll(req, res, next) {
    const { user_id } = req.user;
    const { limit, skip } = req.query;
    const result = await ProductFactory.getProductDraftAll({ product_shop: user_id, limit, skip });
    new OKResponse({ message: 'Product draft fetched successfully', metadata: result }).send(res);
  }
  /**
   * @desc Get all product publish
   * @returns {Array} product
   * @param {*} user_id
   * @param {*} limit
   * @param {*} skip
   */
  async getProductPublishAll(req, res, next) {
    const { user_id } = req.user;
    const { limit, skip } = req.query;
    const result = await ProductFactory.getProductPublishAll({ product_shop: user_id, limit, skip });
    new OKResponse({ message: 'Product published fetched successfully', metadata: result }).send(res);
  }
  /**
   * @desc Post public product
   * @returns {Array} product
   * @param {*} user_id
   * @param {*} id
   */
  async publishProduct(req, res, next) {
    const { user_id } = req.user;
    const { id } = req.params;
    const result = await ProductFactory.publishProduct({ product_shop: user_id, product_id: id });
    new OKResponse({ message: 'Product published successfully', metadata: result }).send(res);
  }
  /**
   * @desc Post unpublic product
   * @returns {Array} product
   * @param {*} user_id
   * @param {*} id
   */
  async unpublishProduct(req, res, next) {
    const { user_id } = req.user;
    const { id } = req.params;
    const result = await ProductFactory.unpublishProduct({ product_shop: user_id, product_id: id });
    new OKResponse({ message: 'Product unpublished successfully', metadata: result }).send(res);
  }
  /**
   * @desc Search product
   * @returns {Array} product
   * @param {*} textSearch
   */
  async searchProduct(req, res, next) {
    const { textSearch } = req.params;
    const result = await ProductFactory.getProductSearch({ textSearch });
    new OKResponse({ message: 'Find Product Successfully', metadata: result }).send(res);
  }
  /**
   * @desc Get all product
   * @returns {Array} product
   */
  async getProductAll(req, res, next) {
    const result = await ProductFactory.getProductAll(req.query);
    new OKResponse({ message: 'Get all products successfully', metadata: result }).send(res);
  }
  /**
   * @desc Get a product by id
   * @returns  product
   */
  async getOneProduct(req, res, next) {
    const result = await ProductFactory.getOneProduct({ product_id: req.params.id });
    new OKResponse({ message: 'Get a product successfully', metadata: result }).send(res);
  }
  async updateProduct(req, res, next) {
    const { id } = req.params;
    const { user_id } = req.user;
    const result = await ProductFactory.updateProduct({
      productId: id,
      payload: { ...req.body, product_shop: user_id },
      type: req.body.product_type
    });
    new OKResponse({ message: 'Product updated successfully', metadata: result }).send(res);
  }
}

module.exports = new ProductController();
