// src/modulos/mantenimiento/pages/TechnicianMantenimientoPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { mantenimientoApi } from '../api/mantenimiento';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTools, 
  faSpinner,
  faExclamationTriangle,
  faSync,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import TechnicianMantenimientoTable from './components/TechnicianMantenimientoTable';
import TechnicianObservationsModal from './components/TechnicianObservationsModal';
import TechnicianStatusModal from './components/TechnicianStatusModal';
import MantenimientoInfoModal from './components/MantenimientoInfoModal';

/**
 * Página especializada para técnicos - gestión de mantenimientos asignados
 */
const TechnicianMantenimientoPage = () => {
  const { user, roles } = useAuth();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Estados para modales
  const [observationsModal, setObservationsModal] = useState({
    isOpen: false,
    mantenimiento: null,
    loading: false
  });
  
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    mantenimiento: null,
    nuevoEstado: '',
    loading: false
  });
  
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    mantenimiento: null
  });

  // Verificar permisos
  const permissions = {
    canChangeStatus: hasPermission(roles, PERMISSIONS.MAINTENANCE.CHANGE_STATUS),
    canAddObservations: hasPermission(roles, PERMISSIONS.MAINTENANCE.ADD_OBSERVATIONS)
  };

  // Cargar mantenimientos asignados al técnico
  const loadMantenimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mantenimientoApi.getAssignedMaintenances();
      
      if (response.success) {
        // Los mantenimientos ya vienen filtrados por el backend para técnicos
        setMantenimientos(response.data || []);
        
        // Calcular estadísticas
        const mantenimientosActivos = response.data?.filter(m => !m.eliminado) || [];
        const statsData = {
          mantenimientos_asignados: mantenimientosActivos.length,
          mantenimientos_pendientes: mantenimientosActivos.filter(m => m.estado === 'pendiente').length,
          mantenimientos_en_proceso: mantenimientosActivos.filter(m => m.estado === 'en_proceso').length,
          mantenimientos_completados_hoy: mantenimientosActivos.filter(m => {
            const hoy = new Date().toDateString();
            const fechaCompletado = m.fecha_completado ? new Date(m.fecha_completado).toDateString() : null;
            return m.estado === 'completado' && fechaCompletado === hoy;
          }).length
        };
        setStats(statsData);
      } else {
        setError(response.error || 'Error al cargar mantenimientos');
      }
    } catch (err) {
      console.error('Error al cargar mantenimientos:', err);
      setError('Error de conexión al cargar mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMantenimientos();
  }, []);

  // Manejar cambio de estado
  const handleChangeStatus = async (mantenimientoId, nuevoEstado) => {
    const mantenimiento = mantenimientos.find(m => m.id === mantenimientoId);
    if (!mantenimiento) return;
    
    setStatusModal({
      isOpen: true,
      mantenimiento,
      nuevoEstado,
      loading: false
    });
  };

  // Confirmar cambio de estado
  const confirmStatusChange = async (mantenimientoId, nuevoEstado, observaciones) => {
    try {
      setStatusModal(prev => ({ ...prev, loading: true }));
      
      const response = await mantenimientoApi.updateStatus(mantenimientoId, nuevoEstado, observaciones);
      
      if (response.success) {
        // Actualizar la lista
        await loadMantenimientos();
        
        // Cerrar modal
        setStatusModal({
          isOpen: false,
          mantenimiento: null,
          nuevoEstado: '',
          loading: false
        });
        
        // Mostrar mensaje de éxito (opcional)
        console.log('Estado actualizado correctamente');
      } else {
        setError(response.error || 'Error al cambiar estado');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error de conexión al cambiar estado');
    } finally {
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Manejar agregar observaciones
  const handleAddObservations = (mantenimiento) => {
    setObservationsModal({
      isOpen: true,
      mantenimiento,
      loading: false
    });
  };

  // Guardar observaciones
  const saveObservations = async (mantenimientoId, formData) => {
    try {
      setObservationsModal(prev => ({ ...prev, loading: true }));
      
      const response = await mantenimientoApi.addObservations(mantenimientoId, formData.observaciones, formData.diagnostico);
      
      if (response.success) {
        // Actualizar la lista
        await loadMantenimientos();
        
        // Cerrar modal
        setObservationsModal({
          isOpen: false,
          mantenimiento: null,
          loading: false
        });
        
        console.log('Observaciones guardadas correctamente');
      } else {
        setError(response.error || 'Error al guardar observaciones');
      }
    } catch (err) {
      console.error('Error al guardar observaciones:', err);
      setError('Error de conexión al guardar observaciones');
    } finally {
      setObservationsModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Manejar ver información
  const handleInfo = (mantenimiento) => {
    setInfoModal({
      isOpen: true,
      mantenimiento
    });
  };

  // Mostrar loading inicial
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <FontAwesomeIcon icon={faTools} className="mr-3 text-blue-600" />
                Panel de Técnico
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Gestiona tus mantenimientos asignados y actualiza su estado
              </p>
            </div>
            
            <button
              onClick={loadMantenimientos}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon 
                icon={loading ? faSpinner : faSync} 
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mis Mantenimientos</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {stats.mantenimientos_asignados}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <FontAwesomeIcon icon={faTools} className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.mantenimientos_pendientes}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">En Proceso</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {stats.mantenimientos_en_proceso}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <FontAwesomeIcon icon={faChartBar} className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completados Hoy</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.mantenimientos_completados_hoy}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <FontAwesomeIcon icon={faTools} className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-3 h-5 w-5" />
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Tabla de mantenimientos */}
        <TechnicianMantenimientoTable
          mantenimientos={mantenimientos}
          permissions={permissions}
          onChangeStatus={handleChangeStatus}
          onAddObservations={handleAddObservations}
          onInfo={handleInfo}
          loading={loading}
        />

        {/* Modales */}
        <TechnicianObservationsModal
          isOpen={observationsModal.isOpen}
          onClose={() => setObservationsModal({ isOpen: false, mantenimiento: null, loading: false })}
          mantenimiento={observationsModal.mantenimiento}
          onSave={saveObservations}
          loading={observationsModal.loading}
        />

        <TechnicianStatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ isOpen: false, mantenimiento: null, nuevoEstado: '', loading: false })}
          mantenimiento={statusModal.mantenimiento}
          nuevoEstado={statusModal.nuevoEstado}
          onConfirm={confirmStatusChange}
          loading={statusModal.loading}
        />

        <MantenimientoInfoModal
          isOpen={infoModal.isOpen}
          onClose={() => setInfoModal({ isOpen: false, mantenimiento: null })}
          mantenimiento={infoModal.mantenimiento}
        />
      </div>
    </div>
  );
};

export default TechnicianMantenimientoPage;
