// src/modules/servicios/components/ServicioTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faRecycle, faTrashRestore,
  faToggleOn, faToggleOff, faInfoCircle, faCogs,
  faCheckCircle, faTimesCircle, faClock, faTag, faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../../utils/constants';
import { hasPermission } from '../../../../utils/rolePermissions';
import { useAuth } from '../../../../context/AuthContext';

const ServicioTable = ({
  servicios,
  permissions, // Recibir permisos como prop
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onToggleActivo,
  onInfo,
  loading
}) => {
  // Usar permisos pasados como props
  const { canEdit, canDelete, canToggleActive, canRestore } = permissions || {};

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Cargando servicios...
      </div>
    );
  }

  if (!servicios || servicios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No se encontraron servicios.
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price || 0);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`.trim();
    }
    return `${minutes} min`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {servicios.map((servicio) => (
            <tr key={servicio.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              
              {/* Servicio */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                      <FontAwesomeIcon icon={faCogs} className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                      <FontAwesomeIcon icon={faCogs} className="mr-2 text-blue-500" />
                      {servicio.nombre}
                    </div>
                    {servicio.descripcion && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {servicio.descripcion}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Categoría */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {servicio.categoria_servicio_nombre || 'Sin categoría'}
                  </span>
                </div>
              </td>

              {/* Precio */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
                  {formatPrice(servicio.precio)}
                </div>
              </td>

              {/* Duración */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-orange-500" />
                  {formatDuration(servicio.duracion_estimada)}
                </div>
              </td>

              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  servicio.activo
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                }`}>
                  <FontAwesomeIcon 
                    icon={servicio.activo ? faCheckCircle : faTimesCircle} 
                    className="mr-1 h-3 w-3" 
                  />
                  {servicio.activo ? 'Activo' : 'Inactivo'}
                </span>
                {servicio.eliminado && (
                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Eliminado
                  </span>
                )}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  
                  {/* Botón EDITAR */}
                  {canEdit && (
                    <button
                      onClick={() => onEdit(servicio)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                      title="Editar servicio"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}

                  {/* Botón INFO */}
                  <button
                    onClick={() => onInfo && onInfo(servicio)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Información del servicio"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>

                  {/* Botón CAMBIAR ESTADO ACTIVO */}
                  {!servicio.eliminado && canToggleActive && (
                    <button
                      onClick={() => onToggleActivo(servicio.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        servicio.activo
                          ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                          : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      }`}
                      title={servicio.activo ? 'Desactivar servicio' : 'Activar servicio'}
                    >
                      <FontAwesomeIcon icon={servicio.activo ? faToggleOff : faToggleOn} />
                    </button>
                  )}

                  {/* Botón RESTAURAR (solo para eliminados) */}
                  {canRestore && servicio.eliminado && (
                    <button
                      onClick={() => onRestore(servicio.id)}
                      className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                      title="Restaurar servicio"
                    >
                      <FontAwesomeIcon icon={faTrashRestore} />
                    </button>
                  )}

                  {/* Botón ELIMINAR SUAVE (solo para no eliminados) */}
                  {canDelete && !servicio.eliminado && (
                    <button
                      onClick={() => onSoftDelete(servicio.id)}
                      className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                      title="Eliminar (reversible)"
                    >
                      <FontAwesomeIcon icon={faRecycle} />
                    </button>
                  )}

                  {/* Botón ELIMINAR PERMANENTE (solo para eliminados) */}
                  {canDelete && servicio.eliminado && (
                    <button
                      onClick={() => onHardDelete(servicio.id)}
                      className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                      title="Eliminar permanentemente"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ServicioTable.propTypes = {
  servicios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      categoria_servicio: PropTypes.number,
      categoria_servicio_nombre: PropTypes.string,
      precio: PropTypes.number,
      duracion_estimada: PropTypes.number,
      activo: PropTypes.bool.isRequired,
      eliminado: PropTypes.bool,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onSoftDelete: PropTypes.func.isRequired,
  onHardDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onToggleActivo: PropTypes.func.isRequired,
  onInfo: PropTypes.func,
  loading: PropTypes.bool.isRequired,
};

export default ServicioTable;