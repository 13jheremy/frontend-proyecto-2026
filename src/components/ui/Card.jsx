// src/components/ui/Card.jsx
import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerActions,
  padding = 'default'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className={`border-b border-gray-200 ${paddingClasses[padding]} pb-4`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={title || subtitle || headerActions ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

export default Card;
