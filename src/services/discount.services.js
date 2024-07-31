'use strict';
const { BadRequest, NotFound } = require('../core/error.response');
const discountModel = require('../models/discount.model');
const { findOneDiscount, findProductByDiscount, findDiscountByShop } = require('../models/repositories/discount.repo');
const { findProductAll, findProducts } = require('../models/repositories/product.repo');
const { converStringToObjectId, removeKeyFalsethyObject } = require('../utils');

class DiscountService {
  //tạo discount [SHOP | ADMIN]
  static async createDiscount(body, shopId) {
    const {
      name,
      description,
      code,
      type,
      value,
      start_date,
      end_date,
      max_uses,
      max_use_per_user,
      min_order_value,
      status,
      productsId
    } = body;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequest('Start date or end date invalid');
    }
    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequest('Start date must be less than end date');
    }
    const foundDiscount = await findOneDiscount({
      discount_code: code,
      discount_shopId: converStringToObjectId(shopId)
    });
    if (foundDiscount) {
      throw new BadRequest('Discount code already exists');
    }
    //Kiểm tra tất cả productsId mà client truyền lên có ở trạng thái published không và có thuộc shop Id không
    if (productsId.length > 0) {
      const foundProducts = await findProducts({ _id: { $in: productsId }, isPublished: true, product_shop: shopId });
      if (foundProducts.length !== productsId.length) {
        throw new BadRequest('Products not published or not from the shop');
      }
    }
    const discount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_code: code,
      discount_type: type,
      discount_value: value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_max_use_per_user: max_use_per_user,
      discount_min_order_value: min_order_value,
      discount_status: status,
      discount_apply: productsId.length > 0 ? 'specific' : 'all',
      discount_products: productsId,
      discount_shopId: converStringToObjectId(shopId)
    });
    return discount;
  }
  //[SHOP | ADMIN]
  static async updateDiscount({ id, payload }) {
    //loại bỏ giá trị null, undefined, rỗng
    const payloadConfig = removeKeyFalsethyObject(payload);
    const discount = await discountModel.findByIdAndUpdate(id, payloadConfig, { new: true });
    return discount;
  }
  //[USER]
  //Get Products by discount
  static async getAllProductsByDiscountCode({ code, shopId, limit, page, sortBy = 'ctime' }) {
    const foundDiscount = await findOneDiscount({
      discount_code: code,
      discount_shopId: converStringToObjectId(shopId)
    });
    if (!foundDiscount || foundDiscount.discount_status === 'inactive') {
      throw new NotFound('Discount not found');
    }
    const discountId = foundDiscount._id.toString();
    const discountApply = foundDiscount.discount_apply;
    let productsDiscount;
    if (discountApply === 'all') {
      //Get all products of shop
      productsDiscount = await findProductAll({
        filter: { product_shop: converStringToObjectId(shopId), isPublished: true },
        limit,
        page,
        sortBy,
        select: ['product_name', 'product_thumb']
      });
    }
    if (discountApply === 'specific') {
      productsDiscount =
        (await findProductByDiscount({ discountId: converStringToObjectId(discountId), limit, page }))
          ?.discount_products || [];
    }
    return productsDiscount;
  }
  //[USER | SHOP]
  //get all discount of shop
  static async getAllDiscountsByShop({ shopId, limit, page }) {
    return await findDiscountByShop({
      shopId: converStringToObjectId(shopId),
      limit,
      page,
      unSelect: ['__v', 'discount_shopId']
    });
  }
  //[USER] - get amount discount of product
  //Khi người dùng sử dụng voucher thì trả về giá trị giảm giá
  static async getAmountDiscountProduct({ discountCode, shopId, userId, products, isOrder = false }) {
    const foundDiscount = await findOneDiscount({
      discount_code: discountCode,
      discount_shopId: converStringToObjectId(shopId)
    });
    if (!foundDiscount || foundDiscount.discount_status === 'inactive') {
      throw new NotFound('Discount not found');
    }
    //Kiểm tra sản phẩm có nằm trong danh sách sản phẩm discount
    if (foundDiscount.discount_apply === 'specific') {
      // console.log('products', products);
      // console.log('foundDiscount.discount_products', foundDiscount.discount_products);
      const productsId = products.map((pro) => pro._id);
      let isFitDiscount = true;
      productsId.forEach((id) => {
        const index = foundDiscount.discount_products.findIndex((proDis) => proDis.toString() === id);
        if (index === -1) isFitDiscount = false;
      });
      if (!isFitDiscount) {
        throw new BadRequest('This discount not suitable product');
      }
    }
    const {
      discount_start_date,
      discount_end_date,
      discount_max_uses,
      discount_user_used,
      discount_max_use_per_user,
      discount_min_order_value,
      discount_type,
      discount_value
    } = foundDiscount;
    //Kiểm tra voucher đã hết hạn chưa
    if (
      new Date().getTime() < new Date(discount_start_date).getTime() ||
      new Date().getTime() > new Date(discount_end_date).getTime()
    ) {
      throw new BadRequest('Discount expired');
    }
    //Kiểm tra số lần sử dụng voucher còn lại
    if (discount_max_uses === 0) {
      throw new BadRequest('Discount has been used up');
    }
    //Kiểm tra số lần sử dụng voucher của user
    let countUserUsed = 0;
    discount_user_used.forEach((user) => {
      if (user.toString() === userId.toString()) {
        countUserUsed++;
      }
    });
    if (countUserUsed >= discount_max_use_per_user) {
      throw new BadRequest('Discount has been used up');
    }
    //Kiểm tra đơn hang có giá trị tối thiểu để sử dụng voucher
    const totalOrder = products.reduce((total, product) => total + product.product_price * product.product_count, 0);
    if (totalOrder < discount_min_order_value) {
      throw new BadRequest('Minimum order value not reached');
    }
    //Tính toán giá trị giảm giá
    const priceDecrease = discount_type === 'percent' ? (totalOrder * discount_value) / 100 : discount_value;
    const priceFinal = totalOrder - priceDecrease;
    //Cập nhật lại số lần sử dụng voucher
    if (isOrder) {
      await discountModel.findByIdAndUpdate(
        foundDiscount._id,
        {
          $inc: { discount_uses_count: 1, discount_max_uses: -1 },
          $addToSet: { discount_user_used: userId }
        },
        { new: true }
      );
    }

    return {
      total_order: totalOrder,
      price_final: priceFinal,
      price_decrease: priceDecrease
    };
  }
  //[SHOP] - delete discount
  static async deleteDiscount({ code, shopId }) {
    //kiểm tra voucher xóa có phải của shop
    const foundDiscount = await findOneDiscount({
      discount_shopId: converStringToObjectId(shopId),
      discount_code: code
    });
    if (!foundDiscount) {
      throw new NotFound('Discount not found');
    }
    const discount = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: converStringToObjectId(shopId)
    });
    return discount;
  }
  //[USER] - cancel discount
  static async cancelDiscount({ code, shopId, userId }) {
    const discount = await findOneDiscount({
      discount_code: code,
      discount_shopId: converStringToObjectId(shopId)
    });
    if (!discount) {
      throw new NotFound('Discount not found');
    }
    const userUsed = discount.discount_user_used;
    const index = userUsed.findIndex((user) => user.toString() === userId.toString());
    if (index === -1) {
      throw new BadRequest('Discount not used');
    }
    await discountModel.findByIdAndUpdate(
      discount._id,
      {
        $inc: { discount_uses_count: -1, discount_max_uses: 1 },
        $pull: { discount_user_used: userId }
      },
      { new: true }
    );
  }
}
module.exports = DiscountService;
