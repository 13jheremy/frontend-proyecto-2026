// src/modules/productos/components/ProductoTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { hasPermission } from '../../../../utils/rolePermissions';
import { PERMISSIONS } from '../../../../utils/constants';
import { useAuth } from '../../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faStar as faStarSolid, faRecycle, faTrashRestore,
  faToggleOn, faToggleOff, faEye, faExclamationTriangle, faInfoCircle,
  faBox, faBarcode, faDollarSign, faCubes, faImage
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const ProductoTable = ({
  productos,
  permissions, // Recibir permisos como prop
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onToggleActivo,
  onToggleDestacado,
  onViewImage,
  onInfo, // nuevo prop para el botón info
  loading
}) => {
  // Usar permisos pasados como props
  const { canEdit, canDelete, canToggleActive, canToggleDestacado, canRestore } = permissions || {};

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Cargando productos...
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No se encontraron productos.
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


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precios
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Imagen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {productos.map((producto) => (
            <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              
              {/* Producto */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                      <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
                      {producto.nombre}
                    </div>
                    {producto.destacado && (
                      <div className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faStarSolid} className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Destacado</span>
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Código */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBarcode} className="mr-2 text-gray-500" />
                  <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                    {producto.codigo}
                  </span>
                </div>
              </td>

              {/* Precios */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center font-medium">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-blue-600" />
                    Venta: {formatPrice(producto.precio_venta)}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
                    Compra: {formatPrice(producto.precio_compra)}
                  </div>
                </div>
              </td>


              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  producto.activo
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                }`}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </span>
                {producto.eliminado && (
                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Eliminado
                  </span>
                )}
              </td>

              {/* Imagen */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {producto.imagen_url ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faImage} className="mr-2 text-purple-500" />
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="h-12 w-12 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="mr-2 text-gray-400" />
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  
                  {/* Botón Info */}
                  <button
                    onClick={() => onInfo(producto)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Ver información detallada"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                  </button>

                  {/* Botón Ver Imagen */}
                  {producto.imagen_url && (
                    <button
                      onClick={() => onViewImage(producto.imagen_url, producto.nombre)}
                      className="p-2 rounded-full text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200"
                      title="Ver imagen ampliada"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón Destacar/No destacar */}
                  {canToggleDestacado && (
                    <button
                      onClick={() => onToggleDestacado(producto.id, !producto.destacado)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        producto.destacado
                          ? 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                          : 'text-gray-600 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                      }`}
                      title={producto.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                    >
                      <FontAwesomeIcon 
                        icon={producto.destacado ? faStarSolid : faStarRegular}
                        className="h-4 w-4"
                      />
                    </button>
                  )}

                  {/* Botón Activar/Desactivar */}
                  {canToggleActive && (
                    <button
                      onClick={() => onToggleActivo(producto.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        producto.activo
                          ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                          : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      }`}
                      title={producto.activo ? 'Desactivar' : 'Activar'}
                    >
                      <FontAwesomeIcon 
                        icon={producto.activo ? faToggleOn : faToggleOff}
                        className="h-4 w-4"
                      />
                    </button>
                  )}

                  {/* Botón Editar */}
                  {canEdit && (
                    <button
                      onClick={() => onEdit(producto)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                      title="Editar producto"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón Restaurar (solo para eliminados) */}
                  {canRestore && producto.eliminado && (
                    <button
                      onClick={() => onRestore(producto.id)}
                      className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                      title="Restaurar producto"
                    >
                      <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón Eliminar Suave (solo para no eliminados) */}
                  {canDelete && !producto.eliminado && (
                    <button
                      onClick={() => onSoftDelete(producto.id)}
                      className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                      title="Eliminar (reversible)"
                    >
                      <FontAwesomeIcon icon={faRecycle} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón Eliminar Permanente (solo para eliminados) */}
                  {canDelete && producto.eliminado && (
                    <button
                      onClick={() => onHardDelete(producto.id)}
                      className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                      title="Eliminar permanentemente"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
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

ProductoTable.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      codigo: PropTypes.string.isRequired,
      precio_compra: PropTypes.number,
      precio_venta: PropTypes.number,
      activo: PropTypes.bool.isRequired,
      destacado: PropTypes.bool.isRequired,
      eliminado: PropTypes.bool,
      imagen_url: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onSoftDelete: PropTypes.func.isRequired,
  onHardDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onToggleActivo: PropTypes.func.isRequired,
  onToggleDestacado: PropTypes.func,
  onViewImage: PropTypes.func,
  onInfo: PropTypes.func, // nuevo prop para info
  loading: PropTypes.bool.isRequired,
};

export default ProductoTable;
