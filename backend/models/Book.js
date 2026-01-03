const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  publishedYear: {
    type: Number,
    required: true,
    min: 1000,
    max: new Date().getFullYear()
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Middleware to prevent negative stock
bookSchema.pre('save', function (next) {
  if (this.availableCopies < 0) {
    return next(new Error('Available copies cannot be negative'));
  }
  next();
});

// Prevent negative copies on update
bookSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.$inc && update.$inc.availableCopies !== undefined) {
    // We'll validate in the controller instead for precise control
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);