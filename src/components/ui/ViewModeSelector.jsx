// src/components/ui/ViewModeSelector.jsx
// Component for switching between different view modes (active, inactive, deleted, all)

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faArchive, 
  faList,
  faEye
} from '@fortawesome/free-solid-svg-icons';

const ViewModeSelector = ({ 
  currentMode = 'active', 
  onModeChange, 
  stats = null,
  className = '',
  size = 'sm'
}) => {
  const modes = [
    {
      key: 'active',
      label: 'Activos',
      icon: faCheck,
      color: 'green',
      count: stats?.activos || stats?.active || null
    },
    {
      key: 'inactive',
      label: 'Inactivos',
      icon: faTimes,
      color: 'red',
      count: stats?.inactivos || stats?.inactive || null
    },
    {
      key: 'deleted',
      label: 'Eliminados',
      icon: faArchive,
      color: 'yellow',
      count: stats?.eliminados || stats?.deleted || null
    },
    {
      key: 'all',
      label: 'Todos',
      icon: faList,
      color: 'blue',
      count: stats?.total || null
    }
  ];

  const sizeConfigs = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  };

  const colorConfigs = {
    green: {
      active: 'bg-green-600 text-white border-green-600',
      inactive: 'bg-white text-green-600 border-green-300 hover:bg-green-50'
    },
    red: {
      active: 'bg-red-600 text-white border-red-600',
      inactive: 'bg-white text-red-600 border-red-300 hover:bg-red-50'
    },
    yellow: {
      active: 'bg-yellow-600 text-white border-yellow-600',
      inactive: 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50'
    },
    blue: {
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
    }
  };

  const sizeClass = sizeConfigs[size] || sizeConfigs.sm;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {modes.map((mode) => {
        const isActive = currentMode === mode.key;
        const colorConfig = colorConfigs[mode.color];
        const buttonClass = isActive ? colorConfig.active : colorConfig.inactive;

        return (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className={`
              inline-flex items-center
              border rounded-lg
              font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current/50
              ${sizeClass}
              ${buttonClass}
            `.trim().replace(/\s+/g, ' ')}
          >
            <FontAwesomeIcon 
              icon={mode.icon} 
              className="mr-2" 
            />
            {mode.label}
            {mode.count !== null && (
              <span className={`
                ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : `bg-${mode.color}-100 text-${mode.color}-800`
                }
              `.trim().replace(/\s+/g, ' ')}>
                {mode.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeSelector;
