import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { buscarMotos } from '../../services/busqueda';

const MotoSearchInput = ({ 
  onSelect, 
  value = null, 
  placeholder = "Buscar moto por placa, marca, modelo o propietario...",
  className = "",
  disabled = false,
  required = false,
  error = null
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedMoto(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMotos = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await buscarMotos(searchQuery);
      setResults(response.results || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Error buscando motos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (selectedMoto) {
      setSelectedMoto(null);
      onSelect(null);
    }

    // Debounce search
    clearTimeout(window.motoSearchTimeout);
    window.motoSearchTimeout = setTimeout(() => {
      searchMotos(newQuery);
    }, 300);
  };

  const handleSelectMoto = (moto) => {
    setSelectedMoto(moto);
    setQuery(moto.display_text);
    setIsOpen(false);
    setResults([]);
    onSelect(moto);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedMoto(null);
    setResults([]);
    setIsOpen(false);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query && results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faMotorcycle} className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={selectedMoto ? selectedMoto.display_text : query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            sm:text-sm
          `}
        />
        
        {(query || selectedMoto) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {loading && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((moto) => (
            <div
              key={moto.id}
              onClick={() => handleSelectMoto(moto)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faMotorcycle} className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {moto.placa} - {moto.marca} {moto.modelo}
                  </div>
                  <div className="text-sm text-gray-500">
                    {moto.propietario.nombre_completo} | {moto.año} | {moto.color}
                  </div>
                  <div className="text-xs text-gray-400">
                    Kilometraje: {moto.kilometraje.toLocaleString()} km
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
          <div className="px-3 py-2 text-sm text-gray-500">
            No se encontraron motos
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoSearchInput;
