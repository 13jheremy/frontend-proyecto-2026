// src/components/ui/FormValidation.jsx
// Comprehensive form validation and error display component

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationCircle, 
  faCheckCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Alert from './Alert';

/**
 * Display validation errors for a specific field
 */
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`mt-1 text-sm text-red-600 dark:text-red-400 flex items-center ${className}`}>
      <FontAwesomeIcon icon={faExclamationCircle} className="mr-1 h-4 w-4" />
      {error}
    </div>
  );
};

/**
 * Display validation success for a specific field
 */
export const FieldSuccess = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`mt-1 text-sm text-green-600 dark:text-green-400 flex items-center ${className}`}>
      <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-4 w-4" />
      {message}
    </div>
  );
};

/**
 * Display validation info for a specific field
 */
export const FieldInfo = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`mt-1 text-sm text-blue-600 dark:text-blue-400 flex items-center ${className}`}>
      <FontAwesomeIcon icon={faInfoCircle} className="mr-1 h-4 w-4" />
      {message}
    </div>
  );
};

/**
 * Display form-level validation errors
 */
export const FormErrors = ({ errors, className = '' }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  const errorList = Object.entries(errors).map(([field, error]) => ({
    field,
    message: Array.isArray(error) ? error[0] : error
  }));

  return (
    <Alert variant="error" className={className}>
      <div className="font-medium mb-2">Por favor corrige los siguientes errores:</div>
      <ul className="list-disc list-inside space-y-1">
        {errorList.map(({ field, message }, index) => (
          <li key={index} className="text-sm">
            <span className="font-medium capitalize">{field.replace('_', ' ')}:</span> {message}
          </li>
        ))}
      </ul>
    </Alert>
  );
};

/**
 * Validation helper functions
 */
export const validators = {
  required: (value, message = 'Este campo es requerido') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Ingresa un email válido') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (minLength, message) => (value) => {
    if (!value) return null;
    if (value.length < minLength) {
      return message || `Debe tener al menos ${minLength} caracteres`;
    }
    return null;
  },

  maxLength: (maxLength, message) => (value) => {
    if (!value) return null;
    if (value.length > maxLength) {
      return message || `No debe exceder ${maxLength} caracteres`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message || 'Formato inválido';
    }
    return null;
  },

  numeric: (value, message = 'Debe ser un número válido') => {
    if (!value) return null;
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return message;
    }
    return null;
  },

  positive: (value, message = 'Debe ser un número positivo') => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return message;
    }
    return null;
  },

  min: (minValue, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < minValue) {
      return message || `Debe ser mayor o igual a ${minValue}`;
    }
    return null;
  },

  max: (maxValue, message) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > maxValue) {
      return message || `Debe ser menor o igual a ${maxValue}`;
    }
    return null;
  },

  phone: (value, message = 'Ingresa un número de teléfono válido') => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return message;
    }
    return null;
  },

  url: (value, message = 'Ingresa una URL válida') => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  date: (value, message = 'Ingresa una fecha válida') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  futureDate: (value, message = 'La fecha debe ser futura') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date <= now) {
      return message;
    }
    return null;
  },

  pastDate: (value, message = 'La fecha debe ser pasada') => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date >= now) {
      return message;
    }
    return null;
  }
};

/**
 * Validate form data against validation rules
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    const fieldValidators = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

    for (const validator of fieldValidators) {
      const error = typeof validator === 'function' ? validator(value) : null;
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Custom hook for form validation
 */
export const useFormValidation = (initialData = {}, validationRules = {}) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = React.useCallback((field, value) => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return null;

    const fieldValidators = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const validator of fieldValidators) {
      const error = typeof validator === 'function' ? validator(value) : null;
      if (error) {
        return error;
      }
    }
    return null;
  }, [validationRules]);

  const setFieldValue = React.useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [validateField, touched]);

  const setFieldTouched = React.useCallback((field, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    if (isTouched) {
      const error = validateField(field, data[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [validateField, data]);

  const validateAll = React.useCallback(() => {
    const { isValid, errors: validationErrors } = validateForm(data, validationRules);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    return isValid;
  }, [data, validationRules]);

  const reset = React.useCallback((newData = initialData) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const isValid = Object.keys(errors).length === 0 && Object.values(errors).every(error => !error);

  return {
    data,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    setData,
    setErrors
  };
};

export default {
  FieldError,
  FieldSuccess,
  FieldInfo,
  FormErrors,
  validators,
  validateForm,
  useFormValidation
};
