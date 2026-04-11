// src/modulos/inventario/pages/components/InventarioTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faInfoCircle, faCheckCircle, faBan,
  faBoxes, faIdCard, faUser, faPhone, faEnvelope, faWarning,
  faArrowUp, faArrowDown, faExchangeAlt, faBox
} from '@fortawesome/free-solid-svg-icons';

const InventarioTable = ({
  inventarios,
  permissions = {},
  onEdit,
  onInfo,
  loading
}) => {

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando inventario...
      </div>
    );
  }

  if (!inventarios || inventarios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faBoxes} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron registros de inventario.
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comienza creando tu primer registro de inventario o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  // Función para determinar el color del stock
  const getStockColor = (stockActual, stockMinimo) => {
    if (stockActual === 0) return 'text-red-600 dark:text-red-400';
    if (stockActual <= stockMinimo) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Función para obtener el ícono de stock
  const getStockIcon = (stockActual, stockMinimo) => {
    if (stockActual === 0) return faBan;
    if (stockActual <= stockMinimo) return faWarning;
    return faCheckCircle;
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
              Stock Actual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stock Mínimo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {inventarios.map((inventario) => (
            <tr key={inventario.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              {/* Columna: Producto */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {inventario.producto_imagen ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={inventario.producto_imagen}
                        alt={inventario.producto_nombre}
                      />
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {inventario.producto_nombre || inventario.producto?.nombre || 'Producto sin nombre'}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      ID Inventario: {inventario.id}
                    </div>
                  </div>
                </div>
              </td>

              {/* Columna: Stock Actual */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={getStockIcon(inventario.stock_actual, inventario.stock_minimo)} 
                    className={`mr-2 ${getStockColor(inventario.stock_actual, inventario.stock_minimo)}`}
                  />
                  <span className={`text-sm font-medium ${getStockColor(inventario.stock_actual, inventario.stock_minimo)}`}>
                    {inventario.stock_actual}
                  </span>
                </div>
              </td>

              {/* Columna: Stock Mínimo */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {inventario.stock_minimo}
                </span>
              </td>

              {/* Columna: Estado */}
              <td className="px-6 py-4 whitespace-nowrap">
                {inventario.eliminado ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Eliminado
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    inventario.activo === true
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <FontAwesomeIcon 
                      icon={inventario.activo === true ? faCheckCircle : faBan} 
                      className="mr-1" 
                    />
                    {inventario.activo === true ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </td>

              {/* Columna: Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  {/* Botón Información */}
                  <button
                    onClick={() => onInfo(inventario)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Ver información"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>

                  {inventario.eliminado ? (
                    // Los registros eliminados no muestran acciones de edición
                    null
                  ) : (
                    // Acciones para registros activos
                    <>
                      {/* Botón Editar */}
                      {permissions.canEdit && (
                        <button
                          onClick={() => onEdit(inventario)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
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

InventarioTable.propTypes = {
  inventarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      producto: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string,
        categoria: PropTypes.shape({
          nombre: PropTypes.string
        })
      })
      ]),
      producto_nombre: PropTypes.string,
      stock_actual: PropTypes.number.isRequired,
      stock_minimo: PropTypes.number.isRequired,
      activo: PropTypes.bool,
      eliminado: PropTypes.bool,
    })
  ).isRequired,
  permissions: PropTypes.shape({
    canEdit: PropTypes.bool,
  }),
  onEdit: PropTypes.func.isRequired,
  onInfo: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default InventarioTable;
