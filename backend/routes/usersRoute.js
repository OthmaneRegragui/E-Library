import express from "express";
import { User } from '../models/userModel.js';
import { Book } from '../models/bookModel.js';

const router = express.Router();

// GET /users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      counter: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// POST /users - Insert a new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error adding user', error: error.message });
  }
});

// GET /users/:id - Get a user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user' });
  }
});

// PUT /users/:id - Update a user by ID
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE /users/:id - Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// GET /users/:id/borrowed-books - Get all books borrowed by a user
router.get('/:id/borrowed-books', async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all books that the user has borrowed
    const borrowedBooks = await Book.find({ 'borrowed_by.user_id': user._id });
    res.json({
      counter: borrowedBooks.length,
      data: borrowedBooks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving borrowed books' });
  }
});

// GET /books - Get all books
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json({
      counter: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books' });
  }
});

export default router;
