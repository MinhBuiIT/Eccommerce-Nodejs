const { omit } = require('lodash');
const { ProductModel } = require('../product.model');
const { handleSelectConfig } = require('../../utils');

const findProductDraftAll = async ({ query, limit, skip }) => {
  return await getProduct({ query, limit, skip });
};
const findProductPublishAll = async ({ query, limit, skip }) => {
  return await getProduct({ query, limit, skip });
};
const updatePublicProduct = async ({ query }) => {
  const result = await ProductModel.findOneAndUpdate(query, { isPublished: true, isDraft: false }, { new: true });
  return Number(!!result);
};
const updateUnpublicProduct = async ({ query }) => {
  const result = await ProductModel.findOneAndUpdate(query, { isPublished: false, isDraft: true }, { new: true });
  return Number(!!result);
};
const getProduct = async ({ query, limit, skip }) => {
  return await ProductModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
};
const findProductSearch = async ({ textSearch }) => {
  const regexSearch = new RegExp(textSearch, 'i');
  const product = await ProductModel.find(
    { isPublished: true, $text: { $search: regexSearch } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .lean();
  return product;
};
const findProductAll = async ({ limit, page, sortBy, filter, select }) => {
  const sort = sortBy === 'ctime' ? { _id: -1 } : { _id: 1 };
  return await ProductModel.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select(select)
    .lean();
};
const findProducts = async (filter) => {
  return await ProductModel.find(filter).lean();
};
const findProductAllUnselect = async ({ limit, page, sortBy, filter, unselect }) => {
  const sort = sortBy === 'ctime' ? { _id: -1 } : { _id: 1 };
  return await ProductModel.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select(handleSelectConfig(unselect, 0))
    .lean();
};
const findOneProduct = async ({ product_id, unselect }) => {
  return await ProductModel.findById(product_id).select(handleSelectConfig(unselect, 0)).lean();
};
const updateModelProductById = async ({ productId, model, payload, isNew = true }) => {
  return await model.findByIdAndUpdate(productId, { ...payload }, { new: isNew });
};
module.exports = {
  findProductDraftAll,
  updatePublicProduct,
  findProductPublishAll,
  updateUnpublicProduct,
  findProductSearch,
  findProductAll,
  findOneProduct,
  updateModelProductById,
  findProductAllUnselect,
  findProducts
};
