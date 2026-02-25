// src/modulos/mantenimiento/pages/components/MantenimientoActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTrashRestore, faRecycle, faCheck } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para confirmar acciones en mantenimientos (eliminar, restaurar, etc.).
 */
const MantenimientoActionModal = ({ isOpen, onClose, mantenimiento = null, actionType = null, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!mantenimiento || !actionType) {
    return null;
  }

  const getActionConfig = () => {
    switch (actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Mantenimiento Temporalmente',
          message: `¿Estás seguro de que quieres eliminar temporalmente el mantenimiento "${mantenimiento.descripcion_problema || 'Sin descripción'}"?`,
          details: 'El mantenimiento será marcado como eliminado pero podrá ser restaurado posteriormente.',
          confirmText: 'Eliminar Temporalmente',
          confirmButtonClass: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          icon: faRecycle,
          iconColor: 'text-orange-600'
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Mantenimiento Permanentemente',
          message: `¿Estás seguro de que quieres eliminar permanentemente el mantenimiento "${mantenimiento.descripcion_problema || 'Sin descripción'}"?`,
          details: 'Esta acción no se puede deshacer. El mantenimiento y todos sus detalles serán eliminados definitivamente.',
          confirmText: 'Eliminar Permanentemente',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: faTrash,
          iconColor: 'text-red-600'
        };
      case 'restore':
        return {
          title: 'Restaurar Mantenimiento',
          message: `¿Quieres restaurar el mantenimiento "${mantenimiento.descripcion_problema || 'Sin descripción'}"?`,
          details: 'El mantenimiento volverá a estar activo en el sistema.',
          confirmText: 'Restaurar',
          confirmButtonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          icon: faTrashRestore,
          iconColor: 'text-green-600'
        };
      case 'toggleActivo':
        return {
          title: mantenimiento.activo ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento',
          message: `¿Quieres ${mantenimiento.activo ? 'desactivar' : 'activar'} el mantenimiento "${mantenimiento.descripcion_problema || 'Sin descripción'}"?`,
          details: mantenimiento.activo ? 'El mantenimiento será marcado como inactivo.' : 'El mantenimiento será marcado como activo.',
          confirmText: mantenimiento.activo ? 'Desactivar' : 'Activar',
          confirmButtonClass: mantenimiento.activo ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          icon: mantenimiento.activo ? faExclamationTriangle : faCheck,
          iconColor: mantenimiento.activo ? 'text-yellow-600' : 'text-green-600'
        };
      default:
        return {
          title: 'Acción no reconocida',
          message: 'La acción solicitada no es válida.',
          details: '',
          confirmText: 'Aceptar',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: faExclamationTriangle,
          iconColor: 'text-blue-600'
        };
    }
  };

  const actionConfig = getActionConfig();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(mantenimiento.id, actionType);
      onClose();
    } catch (error) {
      console.error('Error en acción del mantenimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionConfig.title}>
      <div className="space-y-6">
        {/* Icono de advertencia */}
        <div className="flex items-center justify-center">
          <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800`}>
            <FontAwesomeIcon
              icon={actionConfig.icon}
              className={`h-8 w-8 ${actionConfig.iconColor}`}
            />
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {actionConfig.message}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {actionConfig.details}
          </p>
        </div>

        {/* Información del mantenimiento */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Información del Mantenimiento
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">ID:</span>
              <span className="text-gray-900 dark:text-gray-100">#{mantenimiento.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Moto:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {mantenimiento.moto?.marca} {mantenimiento.moto?.modelo} ({mantenimiento.moto?.placa})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Propietario:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {mantenimiento.moto?.propietario?.nombre} {mantenimiento.moto?.propietario?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <span className="text-gray-900 dark:text-gray-100 capitalize">
                {mantenimiento.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Advertencia adicional para eliminación permanente */}
        {actionType === 'hardDelete' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="h-5 w-5 text-red-400 mr-3 flex-shrink-0"
              />
              <div className="text-sm text-red-700 dark:text-red-400">
                <strong>Advertencia:</strong> Esta acción eliminará permanentemente:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>El mantenimiento y toda su información</li>
                  <li>Todos los detalles de servicios asociados</li>
                  <li>Los recordatorios relacionados</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${actionConfig.confirmButtonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                {actionConfig.confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

MantenimientoActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
  actionType: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
};

export default MantenimientoActionModal;