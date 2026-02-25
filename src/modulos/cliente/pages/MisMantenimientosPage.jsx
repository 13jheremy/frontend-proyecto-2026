// src/modulos/cliente/pages/MisMantenimientosPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { clientAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faSpinner, faEye, faClock, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ClienteMantenimientoTable from './components/ClienteMantenimientoTable';
import DetalleMantenimientoModal from '../../mantenimiento/pages/components/DetalleMantenimientoModal';
import { showNotification } from '../../../utils/notifications';

const MisMantenimientosPage = () => {
  const { user } = useAuth();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0
  });

  // Cargar mantenimientos del cliente usando endpoint específico
  const loadMantenimientos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando mantenimientos del cliente...');
      const result = await clientAPI.getMantenimientos();
      console.log('📋 Respuesta de clientAPI.getMantenimientos():', result);
      
      if (result.success && result.data) {
        // Manejar estructura anidada: result.data.data contiene los datos reales
        const responseData = result.data.data || result.data;
        const mantenimientosArray = Array.isArray(responseData) ? responseData : [];
        console.log('🔧 Mantenimientos encontrados:', mantenimientosArray);
        console.log('🔍 Estructura del primer mantenimiento:', mantenimientosArray[0]);
        setMantenimientos(mantenimientosArray);
        
        // Calcular estadísticas
        setStats({
          total: mantenimientosArray.length,
          completados: mantenimientosArray.filter(m => m.estado === 'completado').length,
          enProceso: mantenimientosArray.filter(m => m.estado === 'en_proceso').length,
          pendientes: mantenimientosArray.filter(m => m.estado === 'pendiente').length
        });
      } else if (result.data) {
        // Manejo alternativo si no tiene success pero tiene data
        const responseData = result.data.data || result.data;
        const mantenimientosArray = Array.isArray(responseData) ? responseData : [];
        console.log('🔧 Mantenimientos encontrados (sin success):', mantenimientosArray);
        setMantenimientos(mantenimientosArray);
        
        setStats({
          total: mantenimientosArray.length,
          completados: mantenimientosArray.filter(m => m.estado === 'completado').length,
          enProceso: mantenimientosArray.filter(m => m.estado === 'en_proceso').length,
          pendientes: mantenimientosArray.filter(m => m.estado === 'pendiente').length
        });
      } else {
        console.log('❌ No se encontraron datos de mantenimientos');
        setMantenimientos([]);
      }
    } catch (error) {
      console.error('❌ Error loading mantenimientos:', error);
      showNotification.error('Error al cargar los mantenimientos');
      setMantenimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMantenimientos();
  }, [user]);

  // Handler para ver detalles
  const handleView = (mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setShowDetalleModal(true);
  };

  // Permisos específicos para cliente (solo lectura)
  const clientPermissions = {
    canEdit: false,
    canDelete: false,
    canRestore: false,
    canHardDelete: false,
    canToggleActivo: false
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
        <span className="ml-3 text-lg">Cargando mis mantenimientos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faWrench} className="text-3xl text-yellow-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Mis Mantenimientos
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Historial de mantenimientos realizados a tus motos
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FontAwesomeIcon icon={faWrench} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats.pendientes}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">En Proceso</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {stats.enProceso}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.completados}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de mantenimientos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Historial de Mantenimientos ({mantenimientos.length})
            </h2>
          </div>
          
          <ClienteMantenimientoTable
            mantenimientos={mantenimientos}
            onView={handleView}
            onRefresh={loadMantenimientos}
            loading={loading}
          />
        </div>

        {/* Modal de detalles */}
        {showDetalleModal && selectedMantenimiento && (
          <DetalleMantenimientoModal
            isOpen={showDetalleModal}
            onClose={() => setShowDetalleModal(false)}
            mantenimiento={selectedMantenimiento}
          />
        )}
      </div>
    </div>
  );
};

export default MisMantenimientosPage;
