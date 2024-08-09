import React, { useState } from 'react';
import BackButton from "../components/BackButton";
import Form from "../components/Form";
import Alert from "../components/Alert";
import { backEndUrl } from "../config"

const formConfig = [
  {type: "text", name: "name", label: "Full Name", min: 3, max: 100, required: true, placeholder: "Full Name"},
  {type: "email", name: "email", label: "Email", min: 3, max: 100, required: true, placeholder: "Email"},
  {type: "date", name: "membership_start_date", label: "Membership Start Date", required: true, maxDate: new Date().toISOString().split('T')[0]},
  {type: "date", name: "membership_expiry_date", label: "Membership Expiry Date", required: true, minDate: new Date().toISOString().split('T')[0]},

];

const AddUser = () => {
  const [alert, setAlert] = useState(null);

  const handleSuccess = (data) => {
    console.log('User added successfully:', data);
    setAlert({
      type: 'success',
      title: 'Success',
      body: 'The user was added successfully!',
    });
  };

  const handleError = (error) => {
    console.error('Error adding user:', error);
    setAlert({
      type: 'error',
      title: 'Error',
      body: 'An error occurred while adding the user. Please try again.',
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
          <h1 className="text-4xl my-8 text-center">Add User</h1>
          <BackButton />
        </div>
        <Form 
          format={formConfig}
          method="POST"
          url={`${backEndUrl}/users`}
          onSuccess={handleSuccess}
          onError={handleError}
          submitText="Add New User"
          submittingText="Wait"
        />
      </div>
    </div>
  );
};

export default AddUser;
