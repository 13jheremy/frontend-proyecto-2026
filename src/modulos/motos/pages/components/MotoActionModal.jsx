// src/modules/motos/components/MotoActionModal.jsx
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
  faArchive,
  faMotorcycle
} from '@fortawesome/free-solid-svg-icons';

const MotoActionModal = ({ isOpen, onClose, moto, actionType, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!moto || !actionType) return null;

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Moto (Temporal)',
          message: `¿Está seguro de eliminar temporalmente la moto "${moto.marca} ${moto.modelo}" con placa ${moto.placa}? Podrá restaurarla después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente la moto...`,
          icon: faArchive
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Moto (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE la moto "${moto.marca} ${moto.modelo}" con placa ${moto.placa}? Esta acción no se puede deshacer y eliminará todos los datos asociados incluyendo historial de mantenimientos.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente la moto...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Moto',
          message: `¿Desea restaurar la moto "${moto.marca} ${moto.modelo}" con placa ${moto.placa}?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando moto...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: moto.activo 
            ? `¿Desea desactivar la moto "${moto.marca} ${moto.modelo}" con placa ${moto.placa}?`
            : `¿Desea activar la moto "${moto.marca} ${moto.modelo}" con placa ${moto.placa}?`,
          confirmText: moto.activo ? 'Desactivar' : 'Activar',
          confirmClass: moto.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: moto.activo
            ? `Desactivando moto...`
            : `Activando moto...`,
          icon: moto.activo ? faToggleOff : faToggleOn
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
      await onConfirm(moto.id, actionType);
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
        {/* Información de la moto */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faMotorcycle} />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {moto.marca} {moto.modelo} ({moto.año})
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Placa: {moto.placa}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Propietario: {moto.propietario_nombre || 'No asignado'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Cilindrada: {moto.cilindrada}cc • Color: {moto.color}
              </div>
              {moto.kilometraje !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Kilometraje: {moto.kilometraje?.toLocaleString() || 0} km
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

        {/* Advertencia especial para eliminación permanente */}
        {actionType === 'hardDelete' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <FontAwesomeIcon icon={faTrash} className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Esta acción es irreversible
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Se eliminarán todos los datos de la moto incluyendo su historial de mantenimientos, 
                  recordatorios y cualquier información asociada. Considere usar eliminación temporal en su lugar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional para cambio de estado */}
        {actionType === 'toggleActivo' && !moto.activo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <div className="flex">
              <FontAwesomeIcon icon={faToggleOn} className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Activar moto
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  La moto volverá a estar disponible para mantenimientos y servicios.
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

MotoActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  moto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    marca: PropTypes.string.isRequired,
    modelo: PropTypes.string.isRequired,
    año: PropTypes.number.isRequired,
    placa: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    cilindrada: PropTypes.number.isRequired,
    kilometraje: PropTypes.number,
    activo: PropTypes.bool.isRequired,
    propietario_nombre: PropTypes.string,
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']),
  onConfirm: PropTypes.func.isRequired,
};

export default MotoActionModal;