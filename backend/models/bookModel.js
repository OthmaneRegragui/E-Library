import mongoose from "mongoose";

const BorrowerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrow_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  categories: { type: [String], required: true },
  description: { type: String, required: true },
  publication_date: { type: Date, required: true },
  language: { type: String, required: true },
  available_copies: { type: Number, required: true, min: 0 },
  total_copies: { type: Number, required: true, min: 0 },
  borrowed_by: { type: [BorrowerSchema], default: [] },
});

export const Book = mongoose.model('Book', BookSchema);

