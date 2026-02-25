// src/modulos/cliente/pages/MisMotosPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { clientAPI, motorcyclesAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import MotoTable from '../../motos/pages/components/MotoTable';
import InfoMotoModal from '../../motos/pages/components/InfoMotoModal';
import { showNotification } from '../../../utils/notifications';

const MisMotosPage = () => {
  const { user } = useAuth();
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    enMantenimiento: 0
  });

  // Cargar motos del cliente usando endpoint específico
  const loadMotos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando motos del cliente...');
      const result = await clientAPI.getMotos();
      console.log('📋 Respuesta de clientAPI.getMotos():', result);
      
      if (result.success && result.data) {
        // Manejar estructura anidada: result.data.data contiene los datos reales
        const responseData = result.data.data || result.data;
        const motosArray = Array.isArray(responseData) ? responseData : [];
        console.log('🏍️ Motos encontradas:', motosArray);
        setMotos(motosArray);
        
        // Calcular estadísticas
        setStats({
          total: motosArray.length,
          activas: motosArray.filter(m => m.activo).length,
          enMantenimiento: motosArray.filter(m => m.en_mantenimiento).length
        });
      } else if (result.data) {
        // Manejo alternativo si no tiene success pero tiene data
        const responseData = result.data.data || result.data;
        const motosArray = Array.isArray(responseData) ? responseData : [];
        console.log('🏍️ Motos encontradas (sin success):', motosArray);
        setMotos(motosArray);
        
        setStats({
          total: motosArray.length,
          activas: motosArray.filter(m => m.activo).length,
          enMantenimiento: motosArray.filter(m => m.en_mantenimiento).length
        });
      } else {
        console.log('❌ No se encontraron datos de motos');
        setMotos([]);
      }
    } catch (error) {
      console.error('❌ Error loading motos:', error);
      showNotification.error('Error al cargar las motos');
      setMotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMotos();
  }, [user]);

  // Handler para ver detalles de moto
  const handleView = (moto) => {
    setSelectedMoto(moto);
    setShowInfoModal(true);
  };

  // Permisos específicos para cliente (solo lectura)
  const clientPermissions = {
    canEdit: false, // Los clientes no pueden editar motos
    canDelete: false, // Los clientes no pueden eliminar motos
    canRestore: false,
    canHardDelete: false,
    canToggleActivo: false
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
        <span className="ml-3 text-lg">Cargando mis motos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faMotorcycle} className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Mis Motos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Consulta tus motocicletas registradas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Motos</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FontAwesomeIcon icon={faMotorcycle} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Motos Activas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.activas}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FontAwesomeIcon icon={faMotorcycle} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">En Mantenimiento</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {stats.enMantenimiento}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FontAwesomeIcon icon={faMotorcycle} className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de motos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Mis Motocicletas ({motos.length})
            </h2>
          </div>
          
          <MotoTable
            motos={motos}
            permissions={clientPermissions}
            onEdit={() => {}} // Los clientes no pueden editar motos
            onView={handleView}
            onSoftDelete={() => {}} // Función vacía ya que clientes no pueden eliminar
            onHardDelete={() => {}} // Función vacía ya que clientes no pueden eliminar
            onRestore={() => {}} // Función vacía ya que clientes no pueden restaurar
            onToggleActivo={() => {}} // Función vacía ya que clientes no pueden cambiar estado
            loading={loading}
            showOwnerColumn={false} // No mostrar columna propietario ya que todas son del cliente
          />
        </div>


        {showInfoModal && selectedMoto && (
          <InfoMotoModal
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            moto={selectedMoto}
          />
        )}
      </div>
    </div>
  );
};

export default MisMotosPage;
