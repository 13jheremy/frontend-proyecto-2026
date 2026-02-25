// src/modulos/categorias/pages/components/CategoriaServicioActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRecycle, faTrashRestore, faToggleOff, faToggleOn, faTools } from '@fortawesome/free-solid-svg-icons';
import { formatPrecioServicio } from '../../utils/servicioUtils';

const CategoriaServicioActionModal = ({ isOpen, onClose, servicio, actionType, onConfirm, categoriasDisponibles }) => {
  const [loading, setLoading] = useState(false);

  if (!servicio || !actionType) return null;

  const getCategoriaNombre = (categorias, categoriaId) => {
    if (!categorias || !categoriaId) return 'N/A';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'N/A';
  };

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Servicio (Temporal)',
          message: `¿Está seguro de eliminar temporalmente el servicio "${servicio.nombre_servicio}"? Podrá restaurarlo después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente "${servicio.nombre_servicio}"...`,
          icon: faRecycle
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Servicio (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE el servicio "${servicio.nombre_servicio}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente "${servicio.nombre_servicio}"...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Servicio',
          message: `¿Desea restaurar el servicio "${servicio.nombre_servicio}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando servicio "${servicio.nombre_servicio}"...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: servicio.activo
            ? `¿Desea desactivar el servicio "${servicio.nombre_servicio}"?`
            : `¿Desea activar el servicio "${servicio.nombre_servicio}"?`,
          confirmText: servicio.activo ? 'Desactivar' : 'Activar',
          confirmClass: servicio.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: servicio.activo
            ? `Desactivando servicio "${servicio.nombre_servicio}"...`
            : `Activando servicio "${servicio.nombre_servicio}"...`,
          icon: servicio.activo ? faToggleOff : faToggleOn
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
      await onConfirm(servicio.id, actionType);
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
        {/* Información del servicio */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-md text-green-600 dark:text-green-400">
              <FontAwesomeIcon icon={faTools} size="lg" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {servicio.nombre_servicio}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID: {servicio.id}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Categoría: {getCategoriaNombre(categoriasDisponibles, servicio.categoria_id)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Precio: {formatPrecioServicio(servicio.precio)} | Duración: {servicio.duracion_estimada_minutos} min
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Estado: {servicio.activo ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

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

CategoriaServicioActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  servicio: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre_servicio: PropTypes.string.isRequired,
    descripcion_servicio: PropTypes.string,
    categoria_id: PropTypes.number,
    precio: PropTypes.number,
    duracion_estimada_minutos: PropTypes.number,
    activo: PropTypes.bool.isRequired,
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']).isRequired,
  onConfirm: PropTypes.func.isRequired,
  categoriasDisponibles: PropTypes.array,
};

CategoriaServicioActionModal.defaultProps = {
  categoriasDisponibles: [],
};

export default CategoriaServicioActionModal;