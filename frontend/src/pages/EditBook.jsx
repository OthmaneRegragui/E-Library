import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Alert from "../components/Alert"; // Import the Alert component
import { categories, languages } from "../constants";
import { backEndUrl } from "../config"

const EditBook = () => {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const { id } = useParams();

  const fetchBookData = () => {
    setLoading(true);
    axios
      .get(`${backEndUrl}/books/${id}`)
      .then(response => {
        setBook(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setError('An error occurred while fetching the book details.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const handleSuccess = (data) => {
    console.log('Book edited successfully:', data);
    setAlert({
      type: 'success',
      title: 'Success',
      body: 'The book was edited successfully!',
    });
    fetchBookData(); // Refresh the book data
  };

  const handleError = (error) => {
    console.error('Error editing book:', error);
    setAlert({
      type: 'error',
      title: 'Error',
      body: 'An error occurred while editing the book. Please try again.',
    });
  };

  const handleConfirmButton = () => {
    console.log('User confirmed');
    setAlert(null);
  };

  const handleCancelButton = () => {
    console.log('User canceled');
    setAlert(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formConfig = [
    {type: "text", name: "title", label: "Title", min: 3, max: 100, required: true, placeholder: "Title", value: book.title},
    {type: "text", name: "author", label: "Author", min: 3, max: 50, required: true, placeholder: "Author", value: book.author},
    {type: "select", name: "categories", label: "Categories", options: categories, required: true, multiple: true, value: book.categories},
    {type: "textarea", name: "description", label: "Description", min: 3, max: 500, required: true, placeholder: "Description", value: book.description},
    {type: "date", name: "publication_date", label: "Publication Date", required: true, maxDate: new Date().toISOString().split('T')[0], value: book.publication_date},
    {type: "select", name: "language", label: "Languages", options: languages, required: true, value: book.language},
    {type: "number", name: "total_copies", label: "Total Copies", required: true, placeholder: "Total Copies", min: book.available_copies, value: book.total_copies},
    {type: "number", name: "available_copies", label: "Available Copies", required: true, placeholder: "Available Copies", min: 0,max: book.total_copies, value: book.available_copies},
  ];

  return (
    <div className="p-4 relative">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          body={alert.body}
          confirm
          onConfirmButton={alert.type === 'success' ? handleConfirmButton : undefined}
          onCancelButton={alert.type === 'error' ? handleCancelButton : undefined}
        />
      )}
      <div className="justify-between items-center">
        <div className="flex justify-between mb-4">
          <h1 className="text-4xl my-8 text-center">Edit Book</h1>
          <BackButton />
        </div>
        <Form 
          format={formConfig}
          method="PUT"
          url={`${backEndUrl}/books/${id}`}
          onSuccess={handleSuccess}
          onError={handleError}
          submitText="Edit Book"
          submittingText="Wait"
        />
      </div>
    </div>
  );
};

export default EditBook;
