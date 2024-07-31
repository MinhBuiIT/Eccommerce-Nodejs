'use strict';
const { Schema, default: mongoose, model } = require('mongoose');
const { default: slugify } = require('slugify');

const productSchema = new Schema(
  {
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    },
    product_name: {
      type: String,
      required: true,
      index: true
    },
    product_thumb: {
      type: String,
      required: true
    },
    product_slug: {
      type: String
    },
    prouduct_AverageRating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    },
    product_description: String,
    product_price: {
      type: Number,
      required: true
    },
    product_quantity: {
      type: Number,
      required: true
    },
    product_type: {
      type: String,
      required: true,
      enum: ['Clothing', 'Electronics', 'Book']
    },
    product_variations: {
      type: Array,
      default: []
    },
    product_attributes: mongoose.Schema.Types.Mixed,
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false
    }
  },
  { timestamps: true, collection: 'products' }
);
//Tạo index text cho product_name và product_description
productSchema.index({ product_name: 'text', product_description: 'text' });
//Xử lý model product trước khi save
productSchema.pre('save', function (next) {
  if (this.isModified('product_name')) {
    this.product_slug = slugify(this.product_name, { lower: true });
  }
  next();
});
//Tách riêng những chi tiết của sản phẩm ra thành các schema riêng để khi truy vấn lấy ra dữ liệu cho danh mục sản phẩm nhanh hơn
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true
    },
    size: String,
    material: String,
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true, collection: 'clothings' }
);

const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true
    },
    model: String,
    color: String,
    year_of_production: Number,
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true, collection: 'electronics' }
);
const bookSchema = new Schema(
  {
    author: {
      type: String,
      required: true
    },
    page_numbers: Number,
    publishing_year: Number,
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true, collection: 'books' }
);
const ProductModel = mongoose.model('Product', productSchema);
const ClothingModel = mongoose.model('Clothing', clothingSchema);
const ElectronicModel = mongoose.model('Electronic', electronicSchema);
const BookModel = mongoose.model('Book', bookSchema);
module.exports = { ProductModel, ClothingModel, ElectronicModel, BookModel };
