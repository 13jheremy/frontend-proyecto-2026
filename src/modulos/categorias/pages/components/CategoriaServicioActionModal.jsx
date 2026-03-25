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

  // Handle different field names between API responses
  const getNombre = () => servicio.nombre_servicio || servicio.nombre || 'Sin nombre';
  const getPrecio = () => servicio.precio || 0;
  const getDuracion = () => servicio.duracion_estimada_minutos || servicio.duracion_estimada || 0;
  const getCategoriaId = () => servicio.categoria_id || servicio.categoria;

  const getCategoriaNombre = (categorias, categoriaId) => {
    if (!categorias || !categoriaId) return 'N/A';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'N/A';
  };

  const getModalConfig = () => {
    const nombre = getNombre();
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Servicio',
          message: `¿Está seguro de eliminar el servicio "${nombre}"?`,
          confirmText: 'Eliminar',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando"${nombre}"...`,
          icon: faRecycle
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Servicio (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE el servicio "${nombre}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente "${nombre}"...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Servicio',
          message: `¿Desea restaurar el servicio "${nombre}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando servicio "${nombre}"...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: servicio.activo
            ? `¿Desea desactivar el servicio "${nombre}"?`
            : `¿Desea activar el servicio "${nombre}"?`,
          confirmText: servicio.activo ? 'Desactivar' : 'Activar',
          confirmClass: servicio.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: servicio.activo
            ? `Desactivando servicio "${nombre}"...`
            : `Activando servicio "${nombre}"...`,
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
                {getNombre()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID: {servicio.id}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Categoría: {getCategoriaNombre(categoriasDisponibles, getCategoriaId())}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Precio: {formatPrecioServicio(getPrecio())} | Duración: {getDuracion()} min
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
    nombre_servicio: PropTypes.string,
    nombre: PropTypes.string,
    descripcion_servicio: PropTypes.string,
    descripcion: PropTypes.string,
    categoria_id: PropTypes.number,
    categoria: PropTypes.number,
    precio: PropTypes.number,
    duracion_estimada_minutos: PropTypes.number,
    duracion_estimada: PropTypes.number,
    activo: PropTypes.bool,
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']).isRequired,
  onConfirm: PropTypes.func.isRequired,
  categoriasDisponibles: PropTypes.array,
};

CategoriaServicioActionModal.defaultProps = {
  categoriasDisponibles: [],
};

export default CategoriaServicioActionModal;