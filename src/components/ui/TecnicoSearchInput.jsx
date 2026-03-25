import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { posAPI } from '../../services/api';

const TecnicoSearchInput = ({ 
  onSelect, 
  value = null, 
  placeholder = "Buscar tecnico: nombre, CI, apellido...",
  className = "",
  error = null
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTecnico, setSelectedTecnico] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedTecnico(value);
    if (value) {
      // Try different ways to get the display name
      const displayName = value.nombre_completo || value.display_text || getNombreDisplay(value);
      console.log('TECNICO VALUE EFFECT: value:', value, 'displayName:', displayName);
      setQuery(displayName || '');
    }
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

  const searchTecnicos = async (searchQuery) => {
    if (!searchQuery.trim()) {
      // Si no hay query, cargar todos los tecnicos
      setLoading(true);
      try {
        console.log('TECNICO SEARCH: Calling API with empty query');
        const response = await posAPI.buscarTecnicos(searchQuery);
        console.log('TECNICO SEARCH: Full response:', response);
        console.log('TECNICO SEARCH: response.data:', response?.data);
        console.log('TECNICO SEARCH: response.data type:', typeof response?.data);
        console.log('TECNICO SEARCH: response.data length:', response?.data?.length);
        // El backend retorna { success: true, data: [...], status: 200 }
        // response.data es { success: true, data: Array(1), status: 200 }
        // El array real esta en response.data.data
        console.log('TECNICO SEARCH: response.data.data:', response?.data?.data);
        const tecnicos = response.data?.data || [];
        console.log('TECNICO SEARCH: Tecnicos found:', tecnicos);
        setResults(tecnicos);
        setIsOpen(true);
      } catch (error) {
        console.error('TECNICO SEARCH: Error fetching tecnicos:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      console.log('TECNICO SEARCH: Calling API with query:', searchQuery);
      const response = await posAPI.buscarTecnicos(searchQuery);
      console.log('TECNICO SEARCH with query - Full response:', response);
      console.log('TECNICO SEARCH with query - response.data:', response?.data);
      console.log('TECNICO SEARCH with query - response.data.data:', response?.data?.data);
      const tecnicos = response.data?.data || [];
      console.log('TECNICO SEARCH with query - Tecnicos found:', tecnicos);
      setResults(tecnicos);
      setIsOpen(true);
    } catch (error) {
      console.error('TECNICO SEARCH: Error buscando tecnicos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (selectedTecnico) {
      setSelectedTecnico(null);
      onSelect(null);
    }

    // Debounce search
    clearTimeout(window.tecnicoSearchTimeout);
    window.tecnicoSearchTimeout = setTimeout(() => {
      searchTecnicos(newQuery);
    }, 300);
  };

  const handleSelectTecnico = (tecnico) => {
    console.log('TECNICO SELECT: Selected tecnico:', tecnico);
    console.log('TECNICO SELECT: nombre_completo:', tecnico?.nombre_completo);
    console.log('TECNICO SELECT: display_text:', tecnico?.display_text);
    setSelectedTecnico(tecnico);
    // Get the proper display name
    const displayName = tecnico?.nombre_completo || tecnico?.display_text || getNombreDisplay(tecnico);
    console.log('TECNICO SELECT: Setting query to:', displayName);
    setQuery(displayName);
    setIsOpen(false);
    setResults([]);
    onSelect(tecnico);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTecnico(null);
    setResults([]);
    setIsOpen(false);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query && results.length > 0) {
      setIsOpen(true);
    } else if (!query) {
      // Cargar todos los tecnicos al hacer focus sin query
      searchTecnicos('');
    }
  };

  const getNombreDisplay = (tecnico) => {
    // Handle different data structures
    const nombre = tecnico.persona_asociada?.nombre || tecnico.persona_asociada?.nombre_completo || '';
    const apellido = tecnico.persona_asociada?.apellido || '';
    if (nombre || apellido) {
      return `${nombre} ${apellido}`.trim();
    }
    return tecnico.nombre_completo || tecnico.display_text || tecnico.correo_electronico || '';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            bg-white
            sm:text-sm
          `}
        />
        
        {(query || selectedTecnico) && (
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
          {results.map((tecnico) => (
            <div
              key={tecnico.id}
              onClick={() => handleSelectTecnico(tecnico)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getNombreDisplay(tecnico)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tecnico.persona_asociada?.cedula ? `CI: ${tecnico.persona_asociada.cedula}` : tecnico.correo_electronico}
                  </div>
                  {tecnico.persona_asociada?.telefono && (
                    <div className="text-xs text-gray-400">
                      Tel: {tecnico.persona_asociada.telefono}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
          <div className="px-3 py-2 text-sm text-gray-500">
            No se encontraron tecnicos
          </div>
        </div>
      )}
    </div>
  );
};

export default TecnicoSearchInput;
