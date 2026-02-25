// src/modulos/pos/components/TechnicianSelector.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCog,
  faSpinner,
  faExclamationTriangle,
  faCheck,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { posAPI } from '../../../services/api';

const TechnicianSelector = ({ onTechnicianSelect, selectedTechnician = null }) => {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar técnicos disponibles
  const loadTechnicians = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Iniciando carga de técnicos...');
      
      const response = await posAPI.buscarTecnicos();
      
      console.log('📡 Response from POS API:', response);
      
      // El endpoint POS ya devuelve técnicos filtrados
      let techniciansList = [];
      
      if (response && response.data) {
        // Si response.data es un array, usarlo directamente
        if (Array.isArray(response.data)) {
          techniciansList = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Si es paginado, usar results
          techniciansList = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Si está anidado en data.data
          techniciansList = response.data.data;
        }
      } else if (Array.isArray(response)) {
        techniciansList = response;
      }
      
      console.log('📋 Técnicos encontrados:', techniciansList);
      console.log('📊 Cantidad de técnicos:', techniciansList.length);
      console.log('📊 Es array?:', Array.isArray(techniciansList));
      
      // Asegurar que siempre sea un array
      if (!Array.isArray(techniciansList)) {
        console.warn('⚠️ techniciansList no es un array, convirtiendo a array vacío');
        techniciansList = [];
      }
      
      setTecnicos(techniciansList);
      
    } catch (error) {
      console.error('🚨 ERROR COMPLETO cargando técnicos:', error);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error response:', error.response);
      console.error('🚨 Error response data:', error.response?.data);
      console.error('🚨 Error response status:', error.response?.status);
      console.error('🚨 Error response headers:', error.response?.headers);
      
      let errorMessage = 'Error de conexión al cargar técnicos';
      if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para cargar técnicos';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para cargar técnicos';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  // Manejar selección de técnico
  const handleTechnicianSelect = (tecnico) => {
    onTechnicianSelect(tecnico);
    toast.success(`Técnico ${tecnico.nombre_completo || tecnico.correo_electronico} asignado`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-blue-600" />
        <span className="text-gray-600 dark:text-gray-300">Cargando técnicos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
        <button
          onClick={loadTechnicians}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tecnicos.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2" />
          <span className="text-yellow-800 dark:text-yellow-200">
            No hay técnicos disponibles
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {tecnicos.map((tecnico) => {
          const isSelected = selectedTechnician?.id === tecnico.id;
          const nombre = tecnico.persona?.nombre_completo || 
                        `${tecnico.first_name || ''} ${tecnico.last_name || ''}`.trim() ||
                        tecnico.correo_electronico;
          
          return (
            <button
              key={tecnico.id}
              onClick={() => handleTechnicianSelect(tecnico)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected 
                    ? 'bg-blue-100 dark:bg-blue-800' 
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  <FontAwesomeIcon 
                    icon={isSelected ? faCheck : faUserCog} 
                    className={`${
                      isSelected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {tecnico.nombre_completo || tecnico.correo_electronico}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tecnico.correo_electronico}
                  </p>
                  {tecnico.persona_asociada?.telefono && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Tel: {tecnico.persona_asociada.telefono}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {tecnicos.length} técnico{tecnicos.length !== 1 ? 's' : ''} disponible{tecnicos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default TechnicianSelector;
