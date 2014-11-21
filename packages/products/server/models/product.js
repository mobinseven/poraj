'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Product Schema
 */
var ProductSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
    count: {
    type: Number,
        min:0,
    required: true,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
ProductSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

ProductSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

ProductSchema.path('count').validate(function(count) {
  return !!count;
}, 'Count cannot be blank');

/**
 * Statics
 */
ProductSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Product', ProductSchema);
