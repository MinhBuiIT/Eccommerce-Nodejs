'use strict';
const { ProductModel, ClothingModel, ElectronicModel, BookModel } = require('../models/product.model');
const { addProductInventory, updateStockInventory } = require('../models/repositories/inventory.repo');
const {
  findProductDraftAll,
  updatePublicProduct,
  findProductPublishAll,
  updateUnpublicProduct,
  findProductSearch,
  findProductAll,
  findOneProduct,
  updateProduct,
  updateModelProductById
} = require('../models/repositories/product.repo');
const { removeKeyFalsethyObject, covertNestedObjectToStringKeyValue } = require('../utils');

class ProductFactory {
  static stragegyCreateProduct = {};
  static registerProductType(type, classRef) {
    ProductFactory.stragegyCreateProduct[type] = classRef;
  }
  //Post
  static async createProduct(type, payload) {
    // switch (type) {
    //   case 'Clothing':
    //     return await new Clothing(payload).createProduct();
    //   case 'Electronics':
    //     return await new Electronic(payload).createProduct();
    //   default:
    //     throw new Error('Invalid product type');
    // }
    const productClass = ProductFactory.stragegyCreateProduct[type];
    if (!productClass) throw new Error(`Invalid product type ${type}`);
    //ProductFactory.stragegyCreateProduct[type] => Class
    const newProduct = await new productClass(payload).createProduct();
    if (newProduct) {
      await addProductInventory({
        productId: newProduct._id,
        shopId: newProduct.product_shop,
        stock: newProduct.product_quantity
      });
    }
    return newProduct;
  }
  static async publishProduct({ product_shop, product_id }) {
    const query = { product_shop, _id: product_id };
    return await updatePublicProduct({ query });
  }
  static async unpublishProduct({ product_shop, product_id }) {
    const query = { product_shop, _id: product_id };
    return await updateUnpublicProduct({ query });
  }
  //End Post
  //Patch
  static async updateProduct({ productId, payload, type }) {
    const productClass = ProductFactory.stragegyCreateProduct[type];
    if (!productClass) throw new Error(`Invalid product type ${type}`);
    //check product của shop đó mới được update
    const productShop = await ProductModel.findById(productId).lean();
    if (productShop.product_shop.toString() !== payload.product_shop.toString()) {
      throw new Error('You do not have permission to update this product');
    }
    if (productShop.product_type !== type) throw new Error('Invalid product type');
    //ProductFactory.stragegyCreateProduct[type] => Class
    const productUpdate = await new productClass(payload).updateProduct({ productId });
    //Update Inventory
    if (payload.product_quantity) {
      await updateStockInventory({
        productId: productUpdate._id,
        stock: payload.product_quantity
      });
    }
    return productUpdate;
  }
  //End Patch

  //Query
  static async getProductDraftAll({ product_shop, limit = 50, skip }) {
    const query = { product_shop, isDraft: true };
    return await findProductDraftAll({ query, limit, skip });
  }
  static async getProductPublishAll({ product_shop, limit = 50, skip }) {
    const query = { product_shop, isPublished: true };
    return await findProductPublishAll({ query, limit, skip });
  }
  static async getProductSearch({ textSearch }) {
    return await findProductSearch({ textSearch });
  }
  static async getProductAll({ limit = 50, page = 1, sortBy = 'ctime', filter = { isPublished: true } }) {
    return await findProductAll({
      limit,
      page,
      sortBy,
      filter,
      select: ['product_name', 'product_thumb', 'product_price']
    });
  }
  static async getOneProduct({ product_id }) {
    return await findOneProduct({ product_id, unselect: ['__v'] });
  }
  //End Query
}

class Product {
  constructor({
    product_shop,
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_attributes
  }) {
    this.product_shop = product_shop;
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_attributes = product_attributes;
  }
  async createProduct(_id) {
    return await ProductModel.create({ ...this, _id });
  }
  async updateProduct({ productId, payload }) {
    return await updateModelProductById({ productId, model: ProductModel, payload });
  }
}
class Clothing extends Product {
  async createProduct() {
    const clothes = await ClothingModel.create({ ...this.product_attributes, shop_id: this.product_shop });
    const product = await super.createProduct(clothes._id);
    return product;
  }
  async updateProduct({ productId }) {
    //Dữ liệu update
    const dataUpdate = removeKeyFalsethyObject(this);
    /**
     *
     *  product_attributes: {
     *  manufacturer: 'Apple',
     *  model: 'Iphone 12',
     * }
     * =>
     * {
     * product_attributes.manufacturer: 'Apple',}
     *
     *
     */

    //update Product
    // await ElectronicModel.findByIdAndUpdate(productId, { ...this.product_attributes }, { new: true });
    if (dataUpdate.product_attributes) {
      await updateModelProductById({
        productId,
        model: ClothingModel,
        payload: covertNestedObjectToStringKeyValue(dataUpdate.product_attributes)
      });
    }
    const result = await super.updateProduct({ productId, payload: covertNestedObjectToStringKeyValue(dataUpdate) });
    return result;
  }
}
class Electronic extends Product {
  async createProduct() {
    const electronics = await ElectronicModel.create({ ...this.product_attributes, shop_id: this.product_shop });
    const product = await super.createProduct(electronics._id);
    return product;
  }
  async updateProduct({ productId }) {
    //Dữ liệu update
    const dataUpdate = removeKeyFalsethyObject(this);
    /**
     *
     *  product_attributes: {
     *  manufacturer: 'Apple',
     *  model: 'Iphone 12',
     * }
     * =>
     * {
     * product_attributes.manufacturer: 'Apple',}
     *
     *
     */

    //update Product
    // await ElectronicModel.findByIdAndUpdate(productId, { ...this.product_attributes }, { new: true });
    if (dataUpdate.product_attributes) {
      await updateModelProductById({
        productId,
        model: ElectronicModel,
        payload: covertNestedObjectToStringKeyValue(dataUpdate.product_attributes)
      });
    }
    const result = await super.updateProduct({ productId, payload: covertNestedObjectToStringKeyValue(dataUpdate) });
    return result;
  }
}
class Book extends Product {
  async createProduct() {
    const book = await BookModel.create({ ...this.product_attributes, shop_id: this.product_shop });
    const product = await super.createProduct(book._id);
    return product;
  }
  async updateProduct({ productId }) {
    //Dữ liệu update
    const dataUpdate = removeKeyFalsethyObject(this);
    /**
     *
     *  product_attributes: {
     *  manufacturer: 'Apple',
     *  model: 'Iphone 12',
     * }
     * =>
     * {
     * product_attributes.manufacturer: 'Apple',}
     *
     *
     */

    //update Product
    // await ElectronicModel.findByIdAndUpdate(productId, { ...this.product_attributes }, { new: true });
    if (dataUpdate.product_attributes) {
      await updateModelProductById({
        productId,
        model: BookModel,
        payload: covertNestedObjectToStringKeyValue(dataUpdate.product_attributes)
      });
    }
    const result = await super.updateProduct({ productId, payload: covertNestedObjectToStringKeyValue(dataUpdate) });
    return result;
  }
}
//Đăng ký loại sản phẩm => khi thêm một loại sản phẩm mới chỉ cần thêm vào đây
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronic);
ProductFactory.registerProductType('Book', Book);
module.exports = { ProductFactory };
