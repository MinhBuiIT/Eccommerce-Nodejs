'use strict';

const inventoryModel = require('../inventory.model');

const addProductInventory = async ({ productId, shopId, stock, location = 'unknown' }) => {
  await inventoryModel.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location
  });
};
const updateStockInventory = async ({ productId, stock }) => {
  await inventoryModel.findOneAndUpdate({ inven_productId: productId }, { inven_stock: stock });
};

const orderInventory = async ({ productId, cartId, quantity }) => {
  const query = { inven_productId: productId, inven_stock: { $gte: quantity } };
  const update = {
    $inc: { inven_stock: -Number(quantity) },
    $push: { inven_reservation: { cartId, quantity, createdOn: new Date() } }
  };
  return await inventoryModel.updateOne(query, update, { new: true });
};
const backupInventory = async ({ productId, cartId, quantity }) => {
  const query = { inven_productId: productId };
  const update = {
    $inc: { inven_stock: Number(quantity) },
    $pull: { inven_reservation: { cartId } }
  };
  return await inventoryModel.updateOne(query, update, { new: true });
};
module.exports = { addProductInventory, updateStockInventory, orderInventory, backupInventory };
