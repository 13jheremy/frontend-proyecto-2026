// src/modulos/pos/components/ServiceSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCogs,
  faSearch,
  faSpinner,
  faClock,
  faDollarSign,
  faExclamationTriangle,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { posAPI } from '../../../services/api';

const ServiceSearchInput = ({ onServiceSelect, placeholder = "Buscar servicios disponibles..." }) => {
  const [query, setQuery] = useState('');
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Buscar servicios
  const searchServicios = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setServicios([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Buscando servicios con query:', searchQuery);

      const response = await posAPI.buscarServicios(searchQuery);

      console.log('📡 Respuesta de posAPI.buscarServicios:', response);

      // posAPI.buscarServicios usa apiRequest que lanza errores directamente
      let serviciosData = [];
      if (response && response.success && response.data) {
        // La respuesta del backend está anidada: response.data contiene otro objeto con data
        if (response.data && response.data.success && response.data.data) {
          serviciosData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          serviciosData = response.data;
        } else {
          serviciosData = [];
        }
      } else if (Array.isArray(response)) {
        serviciosData = response;
      }

      console.log('📋 Servicios encontrados:', serviciosData.length);
      console.log('📋 Primer servicio (si existe):', serviciosData[0]);
      console.log('📋 Todos los servicios:', serviciosData);

      setServicios(serviciosData);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ Error en búsqueda de servicios:', error);
      console.error('❌ Error response:', error.response?.data);
      setServicios([]);
      setShowResults(false);
      toast.error('Error al buscar servicios');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchServicios(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Manejar selección de servicio
  const handleServiceSelect = (servicio) => {
    onServiceSelect(servicio);
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    toast.success(`Servicio "${servicio.nombre}" agregado`);
  };

  // Navegación con teclado
  const handleKeyDown = (e) => {
    if (!showResults || servicios.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < servicios.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < servicios.length) {
          handleServiceSelect(servicios[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatear duración
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon 
            icon={loading ? faSpinner : faCogs} 
            className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} 
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Buscando servicios...
            </div>
          ) : servicios.length > 0 ? (
            <div className="py-2">
              {servicios.map((servicio, index) => {
                console.log('🎨 Renderizando servicio:', servicio.nombre, 'Categoría:', servicio.categoria);
                return (
                  <button
                    key={servicio.id}
                    onClick={() => handleServiceSelect(servicio)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faCogs} className="text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {servicio.nombre}
                            </p>
                            {servicio.descripcion && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {servicio.descripcion}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              {servicio.categoria && (
                                <span className="inline-flex items-center text-xs text-purple-600 dark:text-purple-400">
                                  <FontAwesomeIcon icon={faTag} className="mr-1" />
                                  {servicio.categoria.nombre || (typeof servicio.categoria === 'string' ? servicio.categoria : 'Sin categoría')}
                                </span>
                              )}
                              {servicio.duracion_estimada && (
                                <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                                  {formatDuration(servicio.duracion_estimada)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                          <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                          Bs. {parseFloat(servicio.precio || 0).toFixed(2)}
                        </p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Disponible
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              No se encontraron servicios
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceSearchInput;
