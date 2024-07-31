const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'shops';

// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    verify: {
      type: Boolean,
      default: false
    },
    role: {
      type: Array,
      required: true,
      default: []
    }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);
//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
