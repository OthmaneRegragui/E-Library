import React from 'react';

const Alert = ({ 
  type = 'info', 
  color, 
  title, 
  body, 
  confirm = false, 
  onConfirmButton, 
  onCancelButton 
}) => {
  const baseStyles = 'border-l-4 p-4 rounded-md shadow-md w-full max-w-md mx-auto';

  const typeStyles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    success: 'bg-green-100 border-green-500 text-green-700',
  };

  const customColorStyles = color ? `border-${color} text-${color}` : '';

  const selectedTypeStyle = color ? customColorStyles : typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${baseStyles} ${selectedTypeStyle}`}>
        <div className="flex justify-between items-start">
          {title && <h3 className="font-bold text-lg">{title}</h3>}
        </div>
        <p className="mt-2">{body}</p>
        {(confirm && (onConfirmButton || onCancelButton)) && (
          <div className="flex justify-end space-x-2 mt-4">
            {onConfirmButton && (
              <button
                onClick={onConfirmButton}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md"
              >
                Confirm
              </button>
            )}
            {onCancelButton && (
              <button
                onClick={onCancelButton}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
