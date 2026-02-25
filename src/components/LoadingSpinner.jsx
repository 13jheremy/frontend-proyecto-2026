// ==========================================
// src/components/LoadingSpinner.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingSpinner = ({ size = 'lg', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FontAwesomeIcon 
        icon={faSpinner} 
        spin 
        size={size}
        className="text-blue-600 dark:text-blue-400" 
      />
    </div>
  );
};

export default LoadingSpinner;