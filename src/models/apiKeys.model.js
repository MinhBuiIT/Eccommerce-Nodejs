const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'apiKey';
const COLLECTION_NAME = 'api_keys';
// Declare the Schema of the Mongo model
var apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true
    },
    permissions: {
      type: [String],
      enum: ['0000', '1111', '2222'],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);
