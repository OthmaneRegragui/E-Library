import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';


const Form = ({ format, method, url, onSuccess, onError, submitText, submittingText }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const initialData = {};
    format.forEach(field => {
      if (field.value !== undefined) {
        initialData[field.name] = field.value;
      } else if (field.default) {
        initialData[field.name] = field.default;
      } else if (field.type === 'select' && field.multiple) {
        initialData[field.name] = [];
      }
    });
    setFormData(initialData);
  }, [format]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      const newData = { ...formData };
      let hasChanges = false;

      format.forEach(field => {
        if (field.setValue && formData[field.setValue] !== undefined && formData[field.name] !== formData[field.setValue]) {
          newData[field.name] = formData[field.setValue];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setFormData(newData);
      }
    }
  }, [format, formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue;

    if (type === 'checkbox' && e.target.getAttribute('data-multi-select')) {
      const currentValues = formData[name] || [];
      if (checked) {
        newValue = [...currentValues, value];
      } else {
        newValue = currentValues.filter(v => v !== value);
      }
    } else {
      newValue = type === 'checkbox' ? checked : value;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleDateChange = (date, name) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: date
    }));
    
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateField = (field, value) => {
    const { type, min, max, required, pattern, minDate, maxDate } = field;
    if (required && (value === undefined || value === '' || value === null || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    switch (type) {
      case 'text':
      case 'password':
      case 'textarea':
        if (value && (value.length < min || value.length > max)) {
          return `Must be between ${min} and ${max} characters`;
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        break;
      case 'number':
        const numValue = Number(value);
        if (value && (isNaN(numValue) || numValue < min || numValue > max)) {
          return `Must be a number between ${min} and ${max}`;
        }
        break;
      case 'select':
        if (required && (value === '' || (Array.isArray(value) && value.length === 0))) {
          return 'Please select an option';
        }
        break;
      case 'date':
        if (value) {
          if (minDate && value < new Date(minDate)) {
            if (field.name === 'borrow_date' && minDate === moment().format('YYYY-MM-DD')) {
              return null;
            } else {
              return `Date must be on or after ${new Date(minDate).toLocaleDateString()}`;
            }
          }
          if (maxDate && value >= new Date(maxDate)) {
            return `Date must be on or before ${new Date(maxDate).toLocaleDateString()}`;
          }
        }
        break;
    }

    if (pattern && value && !new RegExp(pattern).test(value)) {
      return 'Invalid format';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
    const newErrors = {};

    format.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      console.log('Attempting to submit form data:', formData);
      try {
        const response = await axios({
          method,
          url,
          data: formData,
        });
        console.log('Form submitted successfully:', response.data);
        onSuccess && onSuccess(response.data);
        setFormData({});
      } catch (error) {
        console.error('Error submitting form:', error);
        onError && onError(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (field) => {
    const { type, name, min, max, options, placeholder, minDate, maxDate } = field;
    const baseInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";

    switch (type) {
      case 'text':
      case 'password':
      case 'email':
      case 'number':
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            min={type === 'number' ? min : undefined}
            max={type === 'number' ? max : undefined}
            minLength={type !== 'number' ? min : undefined}
            maxLength={type !== 'number' ? max : undefined}
            placeholder={placeholder}
            className={baseInputClass}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            minLength={min}
            maxLength={max}
            placeholder={placeholder}
            className={`${baseInputClass} h-32`}
          />
        );
      case 'radio':
        return options.map((option, i) => (
          <div key={i} className="flex items-center mb-2">
            <input
              type="radio"
              id={`${name}-${i}`}
              name={name}
              value={option.value || option}
              checked={formData[name] === (option.value || option)}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor={`${name}-${i}`} className="text-gray-700">{option.label || option}</label>
          </div>
        ));
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={formData[name] || false}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor={name} className="text-gray-700">{field.label}</label>
          </div>
        );
      case 'select':
        if (field.multiple) {
          return (
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="max-h-48 overflow-y-auto p-2 space-y-2">
                {options.map((option, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${name}-${i}`}
                      name={name}
                      value={option.value || option}
                      checked={(formData[name] || []).includes(option.value || option)}
                      onChange={handleChange}
                      data-multi-select="true"
                      className="mr-2"
                    />
                    <label htmlFor={`${name}-${i}`} className="text-gray-700">
                      {option.label || option}
                    </label>
                  </div>
                ))}
              </div>
              <div className="px-2 py-1 bg-gray-100 border-t border-gray-300 text-sm">
                Selected: {(formData[name] || []).length}
              </div>
            </div>
          );
        } else {
          return (
            <select
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              className={baseInputClass}
            >
              <option value="">Select an option</option>
              {options.map((option, i) => (
                <option key={i} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          );
        }
      case 'date':
        return (
          <DatePicker
            selected={formData[name]}
            onChange={(date) => handleDateChange(date, name)}
            minDate={minDate ? new Date(minDate) : null}
            maxDate={maxDate ? new Date(maxDate) : null}
            dateFormat="MM/dd/yyyy"
            className={baseInputClass}
            placeholderText={placeholder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {format.map((field, index) => (
        !field.hidden && (
          <div key={index} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label || field.name}
            </label>
            {renderField(field)}
            {errors[field.name] && <span className="text-red-500 text-sm">{errors[field.name]}</span>}
          </div>
        )
      ))}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (submittingText ? submittingText :'Submitting...') : (submitText ? submitText :'Submit')}
      </button>
    </form>
  );
};

export default Form;