import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Alert from "../components/Alert";
import Table from "../components/Table";
import { BsJournalBookmarkFill } from "react-icons/bs";
import moment from 'moment';
import { backEndUrl } from "../config"

const formConfig = [
  { type: "text", name: "name", label: "Full Name", min: 3, max: 100, required: true, placeholder: "Full Name" },
  { type: "email", name: "email", label: "Email", min: 3, max: 100, required: true, placeholder: "Email" },
  { type: "date", name: "membership_start_date", label: "Membership Start Date", required: true, maxDate: new Date().toISOString().split('T')[0] },
  { type: "date", name: "membership_expiry_date", label: "Membership Expiry Date", required: true, minDate: new Date().toISOString().split('T')[0] },
];

const EditUser = () => {
  const [alert, setAlert] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchBorrowedBooks(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/users`);
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        body: 'An error occurred while fetching users. Please try again.',
      });
    }
  };

  const fetchBorrowedBooks = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${backEndUrl}/users/${userId}/borrowed-books`);
      setBorrowedBooks(response.data.data);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        body: 'An error occurred while fetching borrowed books. Please try again.',
      });
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
  };

  const handleSuccess = (data) => {
    console.log('User updated successfully:', data);
    setAlert({
      type: 'success',
      title: 'Success',
      body: 'The user was updated successfully!',
      onConfirmButton: () => setAlert(null),

    });

    // Update the selectedUser with the new data
    setSelectedUser(data);

    // Update the users and filteredUsers arrays
    const updatedUsers = users.map(user =>
      user._id === data._id ? data : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  };

  const handleError = (error) => {
    console.error('Error updating user:', error);
    setAlert({
      type: 'error',
      title: 'Error',
      body: 'An error occurred while updating the user. Please try again.',
    });
  };

  const confirmEndBorrowing = (bookId) => {
    setAlert({
      type: 'info',
      title: 'Confirm End Borrowing',
      body: 'Are you sure you want to end this borrowing?',
      onConfirmButton: () => endBorrowing(bookId),
      onCancelButton: () => setAlert(null),
    });
  };

  const endBorrowing = async (bookId) => {
    try {
      await axios.delete(`${backEndUrl}/books/${bookId}/end_booking/${selectedUser._id}`);
      setAlert(null);
      fetchBorrowedBooks(selectedUser._id);
    } catch (error) {
      console.error('Error ending borrowing:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        body: 'An error occurred while ending the borrowing. Please try again.',
      });
    }
  };

  const columns = [
    { field: 'title', title: 'Book Title' },
    { field: 'borrow_date', title: 'Borrow Date', render: (book) => moment(book.borrow_date).format('YYYY-MM-DD') },
    { field: 'due_date', title: 'Due Date', render: (book) => moment(book.due_date).format('YYYY-MM-DD') },
    { field: 'actions', title: 'Actions', render: (book) => (
        <div className="flex justify-center gap-x-4">
          <button onClick={() => confirmEndBorrowing(book._id)}>
            <BsJournalBookmarkFill className="text-2xl text-red-800" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-10 relative">
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
      <div className="justify-between items-center">
        <div className="flex justify-between mb-4">
          <h1 className="text-4xl my-8 text-center">Edit User</h1>
          <BackButton />
        </div>
        
        <input
          type="text"
          placeholder="Search users by name"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        
        <select
          onChange={handleUserSelect}
          value={selectedUser ? selectedUser._id : ""}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="">Select a user</option>
          {filteredUsers.map(user => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        
        {selectedUser && (
          <>
            <Form 
              format={formConfig.map(field => ({
                ...field,
                value: selectedUser[field.name]
              }))}
              method="PUT"
              url={`${backEndUrl}/users/${selectedUser._id}`}
              onSuccess={handleSuccess}
              onError={handleError}
              submitText="Update User"
              submittingText="Updating..."
            />
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Borrowed Books</h2>
              {loading ? <div>Loading...</div> : (
                borrowedBooks.length > 0 ? (
                  <Table
                    data={borrowedBooks}
                    columns={columns}
                    search={true}
                    searchArgs={["title", "borrow_date", "due_date"]}
                  />
                ) : (
                  <p>No borrowed books found for this user.</p>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditUser;
