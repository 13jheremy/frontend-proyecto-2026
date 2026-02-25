// src/modulos/recordatorios/pages/components/RecordatorioActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faRecycle, 
  faTrashRestore, 
  faToggleOff, 
  faToggleOn,
  faBell,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const RecordatorioActionModal = ({ isOpen, onClose, recordatorio, actionType, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!recordatorio || !actionType) return null;

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Recordatorio (Temporal)',
          message: `¿Está seguro de eliminar temporalmente el recordatorio para "${recordatorio.categoria_servicio?.nombre || 'Sin nombre'}"? Podrá restaurarlo después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente el recordatorio...`,
          icon: faRecycle
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Recordatorio (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE el recordatorio para "${recordatorio.categoria_servicio?.nombre || 'Sin nombre'}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente el recordatorio...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Recordatorio',
          message: `¿Desea restaurar el recordatorio para "${recordatorio.categoria_servicio?.nombre || 'Sin nombre'}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando recordatorio...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: recordatorio.activo 
            ? `¿Desea desactivar el recordatorio para "${recordatorio.categoria_servicio?.nombre || 'Sin nombre'}"?`
            : `¿Desea activar el recordatorio para "${recordatorio.categoria_servicio?.nombre || 'Sin nombre'}"?`,
          confirmText: recordatorio.activo ? 'Desactivar' : 'Activar',
          confirmClass: recordatorio.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: recordatorio.activo
            ? `Desactivando recordatorio...`
            : `Activando recordatorio...`,
          icon: recordatorio.activo ? faToggleOff : faToggleOn
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: 'Confirme la acción a realizar.',
          confirmText: 'Confirmar',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
          loadingText: 'Procesando...',
          icon: null
        };
    }
  };

  const config = getModalConfig();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(recordatorio.id, actionType);
      onClose();
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="flex flex-col space-y-4">
        {/* Información del recordatorio */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faBell} size="lg" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {recordatorio.categoria_servicio?.nombre || 'Recordatorio sin nombre'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID: {recordatorio.id}
              </div>
              {recordatorio.moto && (
                <>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Moto: {recordatorio.moto.marca} {recordatorio.moto.modelo} ({recordatorio.moto.placa})
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Propietario: {recordatorio.moto.propietario?.nombre || 'No asignado'}
                  </div>
                </>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Fecha: {new Date(recordatorio.fecha_programada).toLocaleDateString('es-ES')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Estado: {recordatorio.enviado ? 'Enviado' : 'Pendiente'} • {recordatorio.activo ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

        {/* Advertencia especial para eliminación permanente */}
        {actionType === 'hardDelete' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Esta acción es irreversible
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Se eliminarán permanentemente todos los datos del recordatorio. 
                  Considere usar eliminación temporal en su lugar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional para cambio de estado */}
        {actionType === 'toggleActivo' && !recordatorio.activo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <div className="flex">
              <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Activar recordatorio
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  El recordatorio volverá a estar activo en el sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : config.confirmClass
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {config.loadingText}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {config.icon && <FontAwesomeIcon icon={config.icon} className="mr-2" />}
                {config.confirmText}
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

RecordatorioActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  recordatorio: PropTypes.object,
  actionType: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
};

export default RecordatorioActionModal;