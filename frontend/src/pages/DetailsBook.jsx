import React, { useEffect, useState } from 'react';
import BackButton from "../components/BackButton";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Table from '../components/Table';
import moment from 'moment';
import { BsJournalBookmarkFill } from "react-icons/bs";
import Alert from "../components/Alert";
import Info from "../components/Info";
import { backEndUrl } from "../config"

const DetailsBook = () => {
  const [book, setBook] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const { id } = useParams();

  const columns = [
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
    { field: 'borrow_date', title: 'Borrow Date', render: (borrower) => moment(borrower.borrow_date).format('YYYY-MM-DD') },
    { field: 'due_date', title: 'Due Date', render: (borrower) => moment(borrower.due_date).format('YYYY-MM-DD') },
    { field: 'actions', title: 'Actions', render: (borrower) => (
        <div className="flex justify-center gap-x-4">
          <button onClick={() => confirmEndBorrowing(borrower._id)}>
            <BsJournalBookmarkFill className="text-2xl text-red-800" />
          </button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const bookResponse = await axios.get(`${backEndUrl}/books/${id}`);
      setBook(bookResponse.data);
      const borrowersInfo = await fetchBorrowersInfo(bookResponse.data.borrowed_by);
      setBorrowers(borrowersInfo);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('An error occurred while fetching the book details.');
    }
    setLoading(false);
  };

  const fetchBorrowersInfo = async (borrowedBy) => {
    return Promise.all(
      borrowedBy.map(async (borrower) => {
        try {
          const userResponse = await axios.get(`${backEndUrl}/users/${borrower.user_id}`);
          return { ...borrower, email: userResponse.data.email, name: userResponse.data.name };
        } catch (error) {
          console.error('Error fetching user info:', error);
          return borrower;
        }
      })
    );
  };

  const confirmEndBorrowing = (borrowerId) => {
    setAlert({
      type: 'info',
      title: 'Confirm End Borrowing',
      body: 'Are you sure you want to end this borrowing?',
      onConfirmButton: () => endBorrowing(borrowerId),
      onCancelButton: () => setAlert(null),
    });
  };

  const endBorrowing = async (borrowerId) => {
    try {
      await axios.delete(`${backEndUrl}/books/${id}/borrower/${borrowerId}`);
      setAlert(null);
      fetchBookDetails();
    } catch (error) {
      console.error('Error ending borrowing:', error);
      setError('An error occurred while ending the borrowing.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!book) return <div>No book found.</div>;

  const bookData = {
    Title: book.title,
    Author: book.author,
    Categories: book.categories.join(', '),
    Description: book.description,
    'Publication Date': new Date(book.publication_date).toLocaleDateString(),
    Language: book.language,
    'Available Copies': book.available_copies,
    'Total Copies': book.total_copies,
  };

  return (
    <div className="p-4">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          body={alert.body}
          confirm={true} // Ensure confirm is set to true to show buttons
          onConfirmButton={alert.onConfirmButton}
          onCancelButton={alert.onCancelButton}
        />
      )}
      <div className="flex justify-between mb-4">
        <h1 className="text-4xl my-8 text-center">Book Details</h1>
        <BackButton />
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
        <Info data={bookData} />
        <h3 className="text-xl font-bold mt-4 mb-2">Borrowed By:</h3>
        {borrowers.length > 0 ? (
          <Table
            data={borrowers}
            columns={columns}
            search={true}
            searchArgs={["name", "email", "borrow_date", "due_date"]}
          />
        ) : (
          <p>No borrowers for this book.</p>
        )}
      </div>
    </div>
  );
};

export default DetailsBook;
