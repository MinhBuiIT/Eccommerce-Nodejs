const { ProductModel } = require('../product.model');

const checkProductsValid = async (products = []) => {
  return await Promise.all(
    products.map(async (product) => {
      //tìm product
      const foundProduct = await ProductModel.findOne({ _id: product.productId }).lean();
      if (foundProduct) {
        return {
          _id: product.productId,
          product_count: product.quantity,
          product_price: foundProduct.product_price
        };
      }
    })
  );
};
module.exports = { checkProductsValid };
