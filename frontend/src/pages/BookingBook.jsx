import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BackButton from "../components/BackButton";
import Info from "../components/Info";
import Form from '../components/Form';
import Alert from '../components/Alert';
import moment from 'moment';
import { backEndUrl } from "../config"

const BookingBook = () => {
  const [book, setBook] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const [bookAvailable, setBookAvailable] = useState(true);
  const [bookingSuccessful, setBookingSuccessful] = useState(false);
  const [formVisible, setFormVisible] = useState(true); // State for form visibility
  const { id } = useParams();

  const [formFormat, setFormFormat] = useState([
    {
      type: "text",
      name: "user_id",
      required: true,
      value: '',
      hidden: true
    },
    {
      type: 'date',
      name: 'borrow_date',
      label: 'Borrow Date',
      required: true,
      minDate: moment().format('YYYY-MM-DD'),
      maxDate: moment().add(14, 'days').format('YYYY-MM-DD'),
    },
    {
      type: 'date',
      name: 'due_date',
      label: 'Due Date',
      required: true,
      minDate: moment().format('YYYY-MM-DD'),
      maxDate: moment().add(14, 'days').format('YYYY-MM-DD'),
    },
  ]);

  useEffect(() => {
    fetchBookDetails();
    fetchUsers();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/books/${id}`);
      setBook(response.data);
      setBookAvailable(response.data.available_copies > 0);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        body: 'An error occurred while fetching the book details.',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/users`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        body: 'An error occurred while fetching the users.',
      });
    }
  };

  const handleSuccess = (data) => {
    setAlert({
      type: 'success',
      title: 'Success',
      body: 'Book successfully booked!',
    });
    setBookingSuccessful(true);
    setFormVisible(false); // Hide the form after success
    fetchBookDetails();
  };

  const handleError = (error) => {
    console.error('Error booking the book:', error);
    setAlert({
      type: 'error',
      title: 'Error',
      body: 'An error occurred while booking the book.',
    });
  };

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
    setBookingSuccessful(false);
    setFormVisible(true); // Show form when a new user is selected

    if (user && book) {
      const membershipStartDate = moment(user.membership_start_date);
      const membershipExpiryDate = moment(user.membership_expiry_date);
      const today = moment();

      const borrowMinDate = moment.max(membershipStartDate, today).format('YYYY-MM-DD');
      const borrowMaxDate = membershipExpiryDate.format('YYYY-MM-DD');

      setFormFormat(prevFormat => prevFormat.map(field => {
        if (field.name === 'user_id') {
          return { ...field, value: userId };
        }
        if (field.name === 'borrow_date') {
          return { ...field, minDate: borrowMinDate, maxDate: borrowMaxDate };
        }
        if (field.name === 'due_date') {
          return { ...field, minDate: borrowMinDate, maxDate: borrowMaxDate };
        }
        return field;
      }));

      // Check if the user has already borrowed this book
      const hasAlreadyBorrowed = book.borrowed_by.some(borrower => borrower.user_id === userId);
      setAlreadyBorrowed(hasAlreadyBorrowed);
      if (hasAlreadyBorrowed) {
        setAlert({
          type: 'info',
          title: 'Already Borrowed',
          body: 'This user has already borrowed this book. They cannot borrow it again until it is returned.',
        });
      } else {
        setAlert(null);
      }
    }
  };

  const handleDateChange = (name, value) => {
    if (name === 'borrow_date') {
      setFormFormat(prevFormat => prevFormat.map(field => {
        if (field.name === 'due_date') {
          return { ...field, minDate: value };
        }
        return field;
      }));
    }
  };

  const handleSubmit = (formData) => {
    const borrowDate = moment(formData.borrow_date);
    const dueDate = moment(formData.due_date);
    const membershipExpiryDate = moment(selectedUser.membership_expiry_date);

    if (borrowDate.isAfter(membershipExpiryDate) || dueDate.isAfter(membershipExpiryDate)) {
      setAlert({
        type: 'error',
        title: 'Booking Error',
        body: 'The borrow date or due date exceeds the membership expiry date.',
      });
      return false;
    }

    return true;
  };

  // Check if current date is past the membership expiry date
  const isMembershipExpired = selectedUser && moment().isAfter(moment(selectedUser.membership_expiry_date));

  const renderBookingForm = () => {
    if (!bookAvailable) {
      return <div className="text-red-500 font-bold mt-4">This book is currently not available for booking.</div>;
    }

    if (alreadyBorrowed) {
      return <div className="text-yellow-500 font-bold mt-4">This user has already borrowed this book. They cannot borrow it again until it is returned.</div>;
    }

    if (isMembershipExpired) {
      return <div className="text-red-500 font-bold mt-4">Cannot book a book. This user's membership has expired.</div>;
    }

    if (selectedUser && !alreadyBorrowed && !isMembershipExpired && formVisible) {
      return (
        <>
          {bookingSuccessful && (
            <div className="text-green-500 font-bold mt-4 mb-4">
              Book has been successfully booked for this user.
            </div>
          )}
          <Form
            format={formFormat}
            method="post"
            url={`${backEndUrl}/books/${id}/borrow`}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            onError={handleError}
            submitText="Book Now"
            submittingText="Booking..."
            onFieldChange={handleDateChange}
          />
        </>
      );
    }

    return null;
  };

  if (!book) return <div>Loading book details...</div>;

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

  const selectedUserData = selectedUser ? {
    Name: selectedUser.name,
    Email: selectedUser.email,
    "Membership Start Date": moment(selectedUser.membership_start_date).format('YYYY-MM-DD'),
    "Membership Expiry Date": moment(selectedUser.membership_expiry_date).format('YYYY-MM-DD'),
  } : null;

  return (
    <div className="p-4">
      <div className="justify-between items-center">
        <div className="flex justify-between mb-4">
          <h1 className="text-4xl my-8 text-center">Booking Book</h1>
          <BackButton />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {book && (
          <>
            <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
            <Info data={bookData} />
            <select
              id="user-select"
              name="user_id"
              onChange={handleUserSelect}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {selectedUser && (
              <div className="mt-4">
                <h3 className="text-xl font-bold">Selected User Information</h3>
                <Info data={selectedUserData} />
              </div>
            )}
            {renderBookingForm()}
          </>
        )}
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            body={alert.body}
            confirm={true}
            onConfirmButton={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingBook;
