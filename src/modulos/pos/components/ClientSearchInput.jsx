// src/modulos/pos/components/ClientSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faUser, faPlus, faIdCard, faPhone } from '@fortawesome/free-solid-svg-icons';
import { useClientes } from '../hooks/useClientes';

const ClientSearchInput = ({ onClientSelect, onCreateClient, selectedClient }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { clientes, buscarClientes, loading } = useClientes();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        await buscarClientes(query);
        setIsOpen(true);
        setSelectedIndex(-1);
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, buscarClientes]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalOptions = (Array.isArray(clientes) ? clientes.length : 0) + 1; // +1 for "Crear nuevo cliente"

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === (Array.isArray(clientes) ? clientes.length : 0)) {
          // Crear nuevo cliente
          handleCreateNew();
        } else if (selectedIndex >= 0 && Array.isArray(clientes) && selectedIndex < clientes.length) {
          handleClientSelect(clientes[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle client selection
  const handleClientSelect = (cliente) => {
    onClientSelect(cliente);
    setQuery(cliente.nombre_completo);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle create new client
  const handleCreateNew = () => {
    if (onCreateClient) {
      onCreateClient(query.trim());
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setQuery(selectedClient.nombre_completo);
    } else {
      setQuery('');
    }
  }, [selectedClient]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cliente por nombre, cédula o teléfono..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {(!Array.isArray(clientes) || clientes.length === 0) && !loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                No se encontraron clientes
              </div>
            </div>
          ) : (
            <>
              {/* Existing clients */}
              {Array.isArray(clientes) && clientes.map((cliente, index) => (
                <div
                  key={cliente.id}
                  className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700
                            ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => handleClientSelect(cliente)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {cliente.nombre_completo}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        {cliente.cedula && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FontAwesomeIcon icon={faIdCard} className="mr-1" />
                            {cliente.cedula}
                          </div>
                        )}
                        {cliente.telefono && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FontAwesomeIcon icon={faPhone} className="mr-1" />
                            {cliente.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create new client option */}
              {query.trim().length >= 2 && onCreateClient && (
                <div
                  className={`p-3 cursor-pointer border-t border-gray-200 dark:border-gray-600
                            ${selectedIndex === (Array.isArray(clientes) ? clientes.length : 0) ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  onClick={handleCreateNew}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        Crear nuevo cliente
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        "{query.trim()}"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Buscando clientes...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearchInput;
