// src/modules/motos/components/PropietarioSearchSelect.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown, faUser, faTimes } from '@fortawesome/free-solid-svg-icons';

const PropietarioSearchSelect = ({ 
  value, 
  onChange, 
  clientesDisponibles, 
  error, 
  placeholder = "Buscar propietario por nombre o cédula..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Encontrar usuario seleccionado cuando cambie el value
  useEffect(() => {
    if (value) {
      const user = clientesDisponibles.find(cliente => cliente.id.toString() === value.toString());
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
      setSearchTerm('');
    }
  }, [value, clientesDisponibles]);

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = clientesDisponibles.filter(cliente => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nombre = cliente.persona?.nombre?.toLowerCase() || '';
    const apellido = cliente.persona?.apellido?.toLowerCase() || '';
    const nombreCompleto = `${nombre} ${apellido}`.toLowerCase();
    const cedula = cliente.persona?.cedula?.toLowerCase() || '';
    const username = cliente.username?.toLowerCase() || '';
    const email = cliente.correo_electronico?.toLowerCase() || '';
    
    return (
      nombreCompleto.includes(searchLower) ||
      cedula.includes(searchLower) ||
      username.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleUserSelect = (cliente) => {
    setSelectedUser(cliente);
    setSearchTerm('');
    setIsOpen(false);
    onChange({
      target: {
        name: 'propietario',
        value: cliente.persona?.id || cliente.id
      }
    });
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setIsOpen(false);
    onChange({
      target: {
        name: 'propietario',
        value: ''
      }
    });
  };

  const displayValue = selectedUser 
    ? selectedUser.persona 
      ? `${selectedUser.persona.nombre} ${selectedUser.persona.apellido} (${selectedUser.username})`
      : `${selectedUser.username} (${selectedUser.correo_electronico})`
    : searchTerm;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="h-4 w-4 text-gray-400" 
          />
        </div>
        
        {/* Botones del lado derecho */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {selectedUser && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded mr-1"
            >
              <FontAwesomeIcon 
                icon={faTimes} 
                className="h-3 w-3 text-gray-400 hover:text-gray-600" 
              />
            </button>
          )}
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <>
              {filteredUsers.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => handleUserSelect(cliente)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon 
                          icon={faUser} 
                          className="h-4 w-4 text-blue-600 dark:text-blue-400" 
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cliente.persona 
                          ? `${cliente.persona.nombre} ${cliente.persona.apellido}`
                          : cliente.username
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {cliente.persona?.cedula && (
                          <>
                            <span className="font-mono">{cliente.persona.cedula}</span>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        <span>@{cliente.username}</span>
                        <span className="mx-2">•</span>
                        <span>{cliente.correo_electronico}</span>
                      </div>
                      {cliente.persona?.telefono && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Tel: {cliente.persona.telefono}
                        </div>
                      )}
                    </div>
                    {selectedUser?.id === cliente.id && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="h-8 w-8 mb-2 mx-auto text-gray-300" />
              <p className="text-sm">No se encontraron usuarios</p>
              {searchTerm && (
                <p className="text-xs mt-1">
                  Búsqueda: "{searchTerm}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Información del usuario seleccionado */}
      {selectedUser && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Seleccionado:</strong> {selectedUser.persona 
              ? `${selectedUser.persona.nombre} ${selectedUser.persona.apellido}`
              : selectedUser.username
            }
            {selectedUser.persona?.cedula && (
              <span> • CI: {selectedUser.persona.cedula}</span>
            )}
            <span> • @{selectedUser.username}</span>
          </div>
        </div>
      )}
    </div>
  );
};

PropietarioSearchSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  clientesDisponibles: PropTypes.array.isRequired,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default PropietarioSearchSelect;