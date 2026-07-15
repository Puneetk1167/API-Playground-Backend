const mongoose = require('mongoose');

const ParamSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    key: { type: String, default: '' },
    value: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const RequestSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Request name is required'],
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },
    url: {
      type: String,
      default: '',
    },
    params: {
      type: [ParamSchema],
      default: [],
    },
    headers: {
      type: [ParamSchema],
      default: [],
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    bodyType: {
      type: String,
      enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'],
      default: 'none',
    },
    auth: {
      type: {
        type: String,
        enum: ['none', 'bearer', 'basic', 'api-key'],
        default: 'none',
      },
      token: { type: String, default: '' },
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      key: { type: String, default: '' },
      value: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', RequestSchema);
