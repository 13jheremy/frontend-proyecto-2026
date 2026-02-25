// src/modules/proveedores/components/ProveedorTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faRecycle, faTrashRestore,
  faToggleOn, faToggleOff, faInfoCircle, faCheckCircle, faBan,
  faBuilding, faIdCard, faUser, faPhone, faEnvelope, faBoxes
} from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../../utils/constants';
import { hasPermission } from '../../../../utils/rolePermissions';
import { useAuth } from '../../../../context/AuthContext';

const ProveedorTable = ({
  proveedores,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando proveedores...
      </div>
    );
  }

  if (!proveedores || proveedores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faBuilding} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron proveedores.
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comienza creando tu primer proveedor o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  const getStatusBadge = (proveedor) => {
    if (proveedor.eliminado) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
          Eliminado
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        proveedor.activo
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        <FontAwesomeIcon 
          icon={proveedor.activo ? faCheckCircle : faBan} 
          className="mr-1 h-3 w-3" 
        />
        {proveedor.activo ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proveedor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Información
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Productos
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
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              
              {/* Proveedor */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {proveedor.nombre}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faIdCard} className="mr-1 h-3 w-3" />
                      NIT: {proveedor.nit}
                    </div>
                  </div>
                </div>
              </td>

              {/* Contacto */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {proveedor.contacto_principal && (
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3 text-green-500" />
                      {proveedor.contacto_principal}
                    </div>
                  )}
                  {proveedor.telefono && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="mr-1 h-3 w-3 text-orange-500" />
                      {proveedor.telefono}
                    </div>
                  )}
                </div>
              </td>

              {/* Información */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {proveedor.correo && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-1 h-3 w-3 text-purple-500" />
                      {proveedor.correo}
                    </div>
                  )}
                  {proveedor.direccion && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={proveedor.direccion}>
                      {proveedor.direccion}
                    </div>
                  )}
                </div>
              </td>

              {/* Productos */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faBoxes} className="mr-1 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {proveedor.productos_count || 0}
                  </span>
                </div>
              </td>

              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStatusBadge(proveedor)}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  
                  {/* Botón EDITAR */}
                  {canEdit && (
                    <button
                      onClick={() => onEdit(proveedor)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                      title="Editar proveedor"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}

                  {/* Botón INFORMACIÓN */}
                  <button
                    onClick={() => onInfo && onInfo(proveedor)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Información del proveedor"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>

                  {/* Botón CAMBIAR ESTADO ACTIVO */}
                  {!proveedor.eliminado && canToggleActive && (
                    <button
                      onClick={() => onToggleActivo(proveedor.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        proveedor.activo
                          ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                          : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      }`}
                      title={proveedor.activo ? 'Desactivar proveedor' : 'Activar proveedor'}
                    >
                      <FontAwesomeIcon icon={proveedor.activo ? faToggleOff : faToggleOn} />
                    </button>
                  )}

                  {/* Botón RESTAURAR (solo para eliminados) */}
                  {canRestore && proveedor.eliminado && (
                    <button
                      onClick={() => onRestore(proveedor.id)}
                      className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                      title="Restaurar proveedor"
                    >
                      <FontAwesomeIcon icon={faTrashRestore} />
                    </button>
                  )}

                  {/* Botón ELIMINAR SUAVE (solo para no eliminados) */}
                  {canDelete && !proveedor.eliminado && (
                    <button
                      onClick={() => onSoftDelete(proveedor.id)}
                      className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                      title="Eliminar (reversible)"
                    >
                      <FontAwesomeIcon icon={faRecycle} />
                    </button>
                  )}

                  {/* Botón ELIMINAR PERMANENTE (solo para eliminados) */}
                  {canDelete && proveedor.eliminado && (
                    <button
                      onClick={() => onHardDelete(proveedor.id)}
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

ProveedorTable.propTypes = {
  proveedores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      nit: PropTypes.string.isRequired,
      contacto_principal: PropTypes.string,
      telefono: PropTypes.string,
      correo: PropTypes.string,
      direccion: PropTypes.string,
      activo: PropTypes.bool.isRequired,
      eliminado: PropTypes.bool,
      productos_count: PropTypes.number,
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

export default ProveedorTable;