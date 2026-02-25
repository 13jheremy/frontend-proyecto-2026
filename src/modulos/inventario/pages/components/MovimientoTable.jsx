// src/modulos/inventario/pages/components/MovimientoTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faInfoCircle, faArrowUp, faArrowDown, 
  faExchangeAlt, faBox, faUser, faCalendarAlt, faHashtag,
  faRecycle, faTrashRestore
} from '@fortawesome/free-solid-svg-icons';
const MovimientoTable = ({
  movimientos,
  permissions,
  onEdit,
  onSoftDelete,
  onRestore,
  onInfo,
  loading
}) => {

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando movimientos...
      </div>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faExchangeAlt} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron movimientos de inventario.
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Los movimientos aparecerán aquí cuando se realicen entradas, salidas o ajustes.
        </p>
      </div>
    );
  }

  // Función para obtener el ícono del tipo de movimiento
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return faArrowUp;
      case 'salida':
        return faArrowDown;
      case 'ajuste':
        return faExchangeAlt;
      default:
        return faExchangeAlt;
    }
  };

  // Función para obtener el color del tipo de movimiento
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'salida':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'ajuste':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Motivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {movimiento.producto_nombre || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {movimiento.producto_codigo || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getTipoColor(movimiento.tipo).split(' ')[0]}`}>
                    <FontAwesomeIcon icon={getTipoIcon(movimiento.tipo)} className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {movimiento.tipo}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {movimiento.cantidad}
                </span>
              </td>

              {/* Columna: Motivo */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={movimiento.motivo}>
                  {movimiento.motivo || 'Sin motivo especificado'}
                </div>
              </td>

              {/* Columna: Usuario */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {movimiento.usuario_nombre || movimiento.usuario?.username || 'Sistema'}
                  </span>
                </div>
              </td>

              {/* Columna: Fecha */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatFecha(movimiento.fecha_registro)}
                  </span>
                </div>
              </td>

              {/* Columna: Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  {/* Botón Información */}
                  <button
                    onClick={() => onInfo(movimiento)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Ver información"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>

                  {movimiento.eliminado ? (
                    // Acciones para movimientos eliminados
                    <>
                      {/* Botón Restaurar */}
                      {permissions?.canRestore && (
                        <button
                          onClick={() => onRestore(movimiento)}
                          className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                          title="Restaurar movimiento"
                        >
                          <FontAwesomeIcon icon={faTrashRestore} />
                        </button>
                      )}
                    </>
                  ) : (
                    // Acciones para movimientos activos
                    <>
                      {/* Botón Editar */}
                      {permissions?.canEdit && (
                        <button
                          onClick={() => onEdit(movimiento)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                          title="Editar movimiento"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}

                      {/* Botón Eliminar Temporalmente */}
                      {permissions?.canDelete && (
                        <button
                          onClick={() => onSoftDelete(movimiento)}
                          className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                          title="Eliminar temporalmente"
                        >
                          <FontAwesomeIcon icon={faRecycle} />
                        </button>
                      )}
                    </>
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

MovimientoTable.propTypes = {
  movimientos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      inventario: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          producto: PropTypes.shape({
            nombre: PropTypes.string,
            codigo: PropTypes.string
          })
        })
      ]),
      producto_nombre: PropTypes.string,
      producto_codigo: PropTypes.string,
      usuario_nombre: PropTypes.string,
      tipo: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
      motivo: PropTypes.string,
      usuario: PropTypes.shape({
        username: PropTypes.string
      }),
      fecha_registro: PropTypes.string,
      eliminado: PropTypes.bool,
    })
  ).isRequired,
  permissions: PropTypes.shape({
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canRestore: PropTypes.bool,
  }),
  onEdit: PropTypes.func.isRequired,
  onSoftDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onInfo: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default MovimientoTable;
