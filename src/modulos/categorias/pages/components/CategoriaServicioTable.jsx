// src/modulos/servicios/pages/components/CategoriaServicioTable.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faTools, faCheckCircle, faBan,
  faToggleOn, faToggleOff, faInfoCircle, faRecycle, faTrashRestore
} from '@fortawesome/free-solid-svg-icons';

/**
 * Componente tabla para mostrar servicios de categoría.
 */
const CategoriaServicioTable = ({
  categoriaServicios,
  onEdit,
  onDelete,
  onToggleActive,
  onInfo,
  onSoftDelete,
  onRestore,
  onHardDelete,
  loading
}) => {
  if (loading && categoriaServicios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando categorías de servicios...</span>
      </div>
    );
  }

  if (categoriaServicios.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faTools} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No hay categorías de servicios disponibles
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comienza registrando tu primera categoría de servicios o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Categoría de Servicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Servicios
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {categoriaServicios.map((categoria) => (
            <tr
              key={categoria.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {categoria.nombre}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {categoria.descripcion || 'Sin descripción'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {categoria.servicios_count || 0} servicios
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {categoria.eliminado ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                    Eliminado
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoria.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <FontAwesomeIcon
                      icon={categoria.activo ? faCheckCircle : faBan}
                      className="mr-1 h-3 w-3"
                    />
                    {categoria.activo ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* Botón EDITAR */}
                  <button
                    onClick={() => onEdit(categoria)}
                    disabled={loading}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                    title="Editar categoría"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  {/* Toggle Activo */}
                  {!categoria.eliminado && (
                    <button
                      onClick={() => onToggleActive && onToggleActive(categoria.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        categoria.activo
                          ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                          : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      }`}
                      title={categoria.activo ? 'Desactivar categoría' : 'Activar categoría'}
                    >
                      <FontAwesomeIcon icon={categoria.activo ? faToggleOff : faToggleOn} />
                    </button>
                  )}

                  {/* Botón INFO */}
                  <button
                    onClick={() => onInfo && onInfo(categoria)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Información de la categoría"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>

                  {/* Lógica eliminación */}
                  {categoria.eliminado ? (
                    <>
                      <button
                        onClick={() => onRestore && onRestore(categoria.id)}
                        className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                        title="Restaurar categoría"
                      >
                        <FontAwesomeIcon icon={faTrashRestore} />
                      </button>
                      <button
                        onClick={() => onHardDelete && onHardDelete(categoria.id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                        title="Eliminar permanentemente"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onSoftDelete && onSoftDelete(categoria.id)}
                      className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                      title="Eliminar temporalmente"
                    >
                      <FontAwesomeIcon icon={faRecycle} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && categoriaServicios.length > 0 && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default CategoriaServicioTable;
