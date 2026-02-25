// src/modulos/reportes/pages/components/ResumenCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ResumenCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor = "text-blue-600 dark:text-blue-400", 
  iconBgColor = "bg-blue-100 dark:bg-blue-900",
  trend = null,
  trendColor = "text-green-600 dark:text-green-400",
  className = ""
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value ?? '--'}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </div>
      
      {icon && (
        <div className={`p-3 ${iconBgColor} rounded-full ml-4`}>
          <FontAwesomeIcon 
            icon={icon} 
            className={`text-xl ${iconColor}`} 
          />
        </div>
      )}
    </div>
  </div>
);

export default ResumenCard;


