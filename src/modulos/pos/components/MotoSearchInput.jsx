// src/modulos/pos/components/MotoSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMotorcycle,
  faSearch,
  faSpinner,
  faPlus,
  faExclamationTriangle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { motorcyclesAPI } from '../../../services/api';

const MotoSearchInput = ({ onMotoSelect, clienteId = null, placeholder = "Buscar moto por placa, marca, modelo, CI o nombre del propietario..." }) => {
  const [query, setQuery] = useState('');
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedMoto, setSelectedMoto] = useState(null);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Buscar motos
  const searchMotos = async (searchQuery) => {
    // Si hay una moto seleccionada y el query coincide con el display text, no buscar
    if (selectedMoto && searchQuery === `${selectedMoto.marca} ${selectedMoto.modelo} - ${selectedMoto.placa}`) {
      setMotos([]);
      setShowResults(false);
      return;
    }

    if (!searchQuery || searchQuery.length < 2) {
      setMotos([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        activo: true,
        limit: 10
      };

      // Si hay cliente seleccionado, filtrar por propietario
      if (clienteId) {
        params.propietario = clienteId;
      }

      // Usar el método search específico para búsqueda de motos
      const response = await motorcyclesAPI.search(searchQuery, params);

      // El backend devuelve datos en formato {success, data, status}
      const motosData = response.data?.data || response.data?.results || response.data || [];
      console.log('🔍 MotoSearchInput - Respuesta de búsqueda:', response);
      console.log('🔍 MotoSearchInput - Datos procesados:', motosData);

      setMotos(Array.isArray(motosData) ? motosData : []);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ Error en búsqueda de motos:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      setMotos([]);
      setShowResults(false);
      toast.error('Error al buscar motos');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMotos(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, clienteId, selectedMoto]);

  // Manejar selección de moto
  const handleMotoSelect = (moto) => {
    setSelectedMoto(moto);
    onMotoSelect(moto);
    setQuery(`${moto.marca} ${moto.modelo} - ${moto.placa}`);
    setShowResults(false);
    setSelectedIndex(-1);
    toast.success(`Moto ${moto.placa} seleccionada`);
  };

  // Limpiar selección de moto
  const handleClearSelection = () => {
    setSelectedMoto(null);
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    onMotoSelect(null); // Notificar que se limpió la selección
    inputRef.current?.focus();
  };

  // Navegación con teclado
  const handleKeyDown = (e) => {
    if (!showResults || motos.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < motos.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < motos.length) {
          handleMotoSelect(motos[selectedIndex]);
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

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon
            icon={loading ? faSpinner : selectedMoto ? faCheck : faMotorcycle}
            className={`${loading ? 'animate-spin' : ''} ${
              selectedMoto ? 'text-green-600' : 'text-gray-400'
            }`}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Si hay una moto seleccionada y el usuario está escribiendo, limpiar la selección
            if (selectedMoto && e.target.value !== `${selectedMoto.marca} ${selectedMoto.modelo} - ${selectedMoto.placa}`) {
              setSelectedMoto(null);
              onMotoSelect(null);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Solo mostrar resultados si no hay moto seleccionada o si el usuario está escribiendo
            if (!selectedMoto && query.length >= 2) {
              setShowResults(true);
            }
          }}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            selectedMoto
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder={placeholder}
        />
        {(query || selectedMoto) && (
          <button
            onClick={handleClearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Limpiar selección"
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
              Buscando motos...
            </div>
          ) : motos.length > 0 ? (
            <div className="py-2">
              {motos.map((moto, index) => (
                <button
                  key={moto.id}
                  onClick={() => handleMotoSelect(moto)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faMotorcycle} className="text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {moto.marca} {moto.modelo} ({moto.año})
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Placa: <span className="font-bold text-blue-600 dark:text-blue-400">{moto.placa}</span>
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Propietario:</span> {moto.propietario?.nombre_completo || 'N/A'}
                            {moto.propietario?.cedula && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                                (CI: {moto.propietario.cedula})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Kilometraje: {moto.kilometraje?.toLocaleString() || '0'} km | Color: {moto.color}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        moto.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {moto.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              No se encontraron motos para "{query}"
              {clienteId && (
                <p className="text-xs mt-1">
                  Buscando solo en las motos del cliente seleccionado
                </p>
              )}
              <p className="text-xs mt-1">
                Verifica que las motos estén activas y disponibles
              </p>
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

export default MotoSearchInput;
