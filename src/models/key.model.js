const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'keys';
// Declare the Schema of the Mongo model
var keySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Shop'
    },
    publicKey: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },
    refreshTokenUsed: {
      type: Array,
      default: []
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keySchema);
