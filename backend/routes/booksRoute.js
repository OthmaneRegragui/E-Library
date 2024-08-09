import express from "express";
import { Book } from "../models/bookModel.js";

const router = express.Router();

// GET /books - Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json({
      counter : books.length,
      data : books
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books' });
  }
});

// POST /books - Insert a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: 'Error adding book', error: error.message });
  }
});

// GET /books/:id - Get a book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving book' });
  }
});

// PUT /books/:id - Update a book by ID
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: 'Error updating book', error: error.message });
  }
});

// DELETE /books/:id - Delete a book by ID
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book' });
  }
});


router.delete('/:id/borrower/:borrowerId', async (req, res) => {
  try {
    const { id, borrowerId } = req.params;

    // Find the book and update it
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, 'borrowed_by._id': borrowerId },
      {
        $pull: { borrowed_by: { _id: borrowerId } },
        $inc: { available_copies: 1 }
      },
      { new: true } // Return the updated document
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book or borrower not found' });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id/end_booking/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Find the book and update it
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, 'borrowed_by.user_id': userId },
      {
        $pull: { borrowed_by: { user_id: userId } },
        $inc: { available_copies: 1 }
      },
      { new: true } // Return the updated document
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book or borrower not found' });
    }

    res.json({ message: 'Borrowing record ended successfully', book: updatedBook });
  } catch (error) {
    console.error('Error ending borrowing record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/borrow', async (req, res) => {
  const { user_id, borrow_date, due_date } = req.body;

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.available_copies < 1) {
      return res.status(400).json({ message: 'No copies available for borrowing' });
    }

    book.borrowed_by.push({ user_id, borrow_date, due_date });
    book.available_copies -= 1;
    await book.save();

    res.status(200).json({ message: 'Book successfully borrowed', book });
  } catch (error) {
    res.status(400).json({ message: 'Error borrowing book', error: error.message });
  }
});
export default router;