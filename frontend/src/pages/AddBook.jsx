import React, { useState } from 'react';
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Alert from "../components/Alert";
import { categories, languages } from "../constants";
import { backEndUrl } from "../config"
const formConfig = [
  {type: "text", name: "title", label: "Title", min: 3, max: 100, required: true, placeholder: "Title"},
  {type: "text", name: "author", label: "Author", min: 3, max: 50, required: true, placeholder: "Author"},
  {type: "select", name: "categories", label: "Categories", options: categories, required: true, multiple: true},
  {type: "textarea", name: "description", label: "Description", min: 3, max: 500, required: true, placeholder: "Description"},
  {type: "date", name: "publication_date", label: "Publication Date", required: true, maxDate: new Date().toISOString().split('T')[0]},
  {type: "select", name: "language", label: "Languages", options: languages, required: true},
  {type: "number", name: "total_copies", label: "Total Copies", required: true, placeholder: "Total Copies", min: 0},
  {type: "number", name: "available_copies", label: "Available Copies", required: true, placeholder: "Available Copies", min: 0, setValue: "total_copies", hidden: true},
  {type: "select", name: "borrowed_by", label: "Borrowed By", options: [], required: false, multiple: true, hidden: true},
];

const AddBook = () => {
  const [alert, setAlert] = useState(null);

  const handleSuccess = (data) => {
    console.log('Book added successfully:', data);
    setAlert({
      type: 'success',
      title: 'Success',
      body: 'The book was added successfully!',
    });
  };

  const handleError = (error) => {
    console.error('Error adding book:', error);
    setAlert({
      type: 'error',
      title: 'Error',
      body: 'An error occurred while adding the book. Please try again.',
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

  return (
    <div className="p-10 relative">
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
          <h1 className="text-4xl my-8 text-center">Add Book</h1>
          <BackButton />
        </div>
        <Form 
          format={formConfig}
          method="POST"
          url="http://localhost:5555/books"
          onSuccess={handleSuccess}
          onError={handleError}
          submitText="Add Book"
          submittingText="Wait"
        />
      </div>
    </div>
  );
};

export default AddBook;
