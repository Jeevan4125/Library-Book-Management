const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// 📚 CREATE: Insert books (used once to seed)
router.post('/seed', async (req, res) => {
  try {
    const books = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'Provide an array of books' });
    }
    const inserted = await Book.insertMany(books);
    res.status(201).json({ message: `${inserted.length} books added`, data: inserted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 READ: All books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 READ: By category
router.get('/category/:category', async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.category });
    if (books.length === 0) {
      return res.status(404).json({ error: 'No books found in this category' });
    }
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 READ: Books after year 2015
router.get('/after-2015', async (req, res) => {
  try {
    const books = await Book.find({ publishedYear: { $gt: 2015 } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE: Adjust copies
router.patch('/:id/copies', async (req, res) => {
  const { change } = req.body; // e.g., +2 or -1
  if (typeof change !== 'number') {
    return res.status(400).json({ error: 'Change must be a number' });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const newCopies = book.availableCopies + change;
    if (newCopies < 0) {
      return res.status(400).json({ error: 'Cannot reduce copies below zero' });
    }

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      { availableCopies: newCopies },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ UPDATE: Change category
router.patch('/:id/category', async (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Valid category required' });
  }

  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      { category },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ DELETE: Only if copies = 0
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    if (book.availableCopies > 0) {
      return res.status(400).json({ error: 'Cannot delete book with available copies' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;