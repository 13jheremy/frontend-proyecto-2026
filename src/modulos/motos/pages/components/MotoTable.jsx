// src/modulos/motos/pages/components/MotoTable.jsx
import React from 'react';
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faInfoCircle, 
  faTrash, 
  faUndo, 
  faToggleOn, 
  faToggleOff,
  faSpinner,
  faMotorcycle,
  faUser,
  faIdCard,
  faPhone,
  faCogs,
  faCalendarAlt,
  faTachometerAlt,
  faPalette,
  faRoad,
  faCheckCircle,
  faBan,
  faTrashRestore,
  faRecycle
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente tabla para mostrar motos con funcionalidades completas.
 */
const MotoTable = ({
  motos,
  permissions, // Recibir permisos como prop
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onToggleActivo,
  onInfo,
  loading,
  usuariosDisponibles = []
}) => {
  // Usar permisos pasados como props
  const { canEdit, canDelete, canToggleActive, canRestore } = permissions || {};
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando motocicletas...
      </div>
    );
  }

  if (!motos || motos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faMotorcycle} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron motocicletas.
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comienza creando tu primera motocicleta o ajusta los filtros de búsqueda.
        </p>
    </div>
    );
  }

  const getStatusBadge = (moto) => {
    if (moto.eliminado) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
          Eliminada
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        moto.activo
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        <FontAwesomeIcon 
          icon={moto.activo ? faCheckCircle : faBan} 
          className="mr-1 h-3 w-3" 
        />
        {moto.activo ? 'Activa' : 'Inactiva'}
      </span>
    );
  };

  const getPropietarioNombre = (moto) => {
    // Primero intenta usar el campo directo de la API
    if (moto.propietario_nombre) {
      return moto.propietario_nombre;
    }
    // Si propietario es un objeto (del API anidado), extraer el nombre
    if (typeof moto.propietario === 'object' && moto.propietario !== null) {
      // Verificar si tiene persona anidada
      if (moto.propietario.persona) {
        return `${moto.propietario.persona.nombre} ${moto.propietario.persona.apellido}`;
      }
      // Verificar si tiene nombre_completo
      if (moto.propietario.nombre_completo) {
        return moto.propietario.nombre_completo;
      }
      // Verificar si tiene nombre y apellido directos
      if (moto.propietario.nombre) {
        return `${moto.propietario.nombre} ${moto.propietario.apellido || ''}`.trim();
      }
    }
    // Fallback: buscar en la lista de usuarios si es un ID numérico
    if (typeof moto.propietario === 'number') {
      const usuario = usuariosDisponibles.find(u => u.id === moto.propietario);
      if (usuario && usuario.persona) {
        return `${usuario.persona.nombre} ${usuario.persona.apellido}`;
      }
    }
    return 'Desconocido';
  };

  const formatearFecha = (fechaISO) => {
    try {
      return format(new Date(fechaISO), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Motocicleta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propietario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detalles Técnicos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {motos.map((moto) => (
            <tr key={moto.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              
              {/* Motocicleta */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <FontAwesomeIcon icon={faMotorcycle} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {moto.marca} {moto.modelo}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faIdCard} className="mr-1 h-3 w-3" />
                      Placa: {moto.placa}
                    </div>
                  </div>
                </div>
              </td>

              {/* Propietario */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {moto.propietario ? (
                    <>
                      <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3 text-green-500" />
                        {moto.propietario_nombre || getPropietarioNombre(moto)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {(() => {
                          // Determinar el usuario: si propietario es objeto, usarlo directamente; sino buscar en lista
                          let usuario = null;
                          if (typeof moto.propietario === 'object' && moto.propietario !== null) {
                            usuario = moto.propietario;
                          } else {
                            usuario = usuariosDisponibles.find(u => u.id === moto.propietario);
                          }
                          return usuario ? (
                            <>
                              <span>@{usuario.username}</span>
                              {usuario.persona?.cedula && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-mono">CI: {usuario.persona.cedula}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <span>ID: {typeof moto.propietario === 'number' ? moto.propietario : 'N/A'}</span>
                          );
                        })()}
                      </div>
                      {(() => {
                        // Determinar el usuario: si propietario es objeto, usarlo directamente; sino buscar en lista
                        let usuario = null;
                        if (typeof moto.propietario === 'object' && moto.propietario !== null) {
                          usuario = moto.propietario;
                        } else {
                          usuario = usuariosDisponibles.find(u => u.id === moto.propietario);
                        }
                        const telefono = usuario?.persona?.telefono;
                        return telefono && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <FontAwesomeIcon icon={faPhone} className="mr-1 h-3 w-3 text-orange-500" />
                            {telefono}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <span className="text-sm text-red-500 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                      Sin Propietario
                    </span>
                  )}
                </div>
              </td>

              {/* Detalles Técnicos */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    Año: {moto.año} - {moto.color}
                  </div>
                  {moto.cilindrada && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Cilindrada: {moto.cilindrada}cc
                    </div>
                  )}
                  {moto.kilometraje !== undefined && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Km: {moto.kilometraje.toLocaleString()}
                    </div>
                  )}
                </div>
              </td>

              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStatusBadge(moto)}
              </td>

              {/* Registro */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 h-3 w-3" />
                  {moto.fecha_registro ? formatearFecha(moto.fecha_registro) : 'N/A'}
                </div>
              </td>

              {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center space-x-2">
                
                {/* Botón INFORMACIÓN */}
                <button
                  onClick={() => onInfo && onInfo(moto)}
                  className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                  title="Información de la motocicleta"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                </button>

                {/* Botón EDITAR */}
                {canEdit && (
                  <button
                    onClick={() => onEdit(moto)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                    title="Editar motocicleta"
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </button>
                )}

                {/* Botón CAMBIAR ESTADO ACTIVO */}
                {!moto.eliminado && canToggleActive && (
                  <button
                    onClick={() => onToggleActivo(moto.id)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      moto.activo
                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    title={moto.activo ? 'Desactivar motocicleta' : 'Activar motocicleta'}
                  >
                    <FontAwesomeIcon icon={moto.activo ? faToggleOff : faToggleOn} className="h-4 w-4" />
                  </button>
                )}

                {/* Lógica eliminación */}
                {moto.eliminado ? (
                  <>
                    {canRestore && (
                      <button
                        onClick={() => onRestore(moto.id)}
                        className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                        title="Restaurar motocicleta"
                      >
                        <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onHardDelete(moto.id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                        title="Eliminar permanentemente"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    )}
                  </>
                ) : (
                  canDelete && (
                    <button
                      onClick={() => onSoftDelete(moto.id)}
                      className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                      title="Eliminar temporalmente"
                    >
                      <FontAwesomeIcon icon={faRecycle} className="h-4 w-4" />
                    </button>
                  )
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

MotoTable.propTypes = {
  motos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      marca: PropTypes.string.isRequired,
      modelo: PropTypes.string.isRequired,
      placa: PropTypes.string.isRequired,
      año: PropTypes.number,
      color: PropTypes.string,
      cilindrada: PropTypes.number,
      kilometraje: PropTypes.number,
      activo: PropTypes.bool.isRequired,
      eliminado: PropTypes.bool,
      fecha_registro: PropTypes.string,
      usuario: PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string,
        persona: PropTypes.shape({
          telefono: PropTypes.string,
        })
      })
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onSoftDelete: PropTypes.func.isRequired,
  onHardDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onToggleActivo: PropTypes.func.isRequired,
  onInfo: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  usuariosDisponibles: PropTypes.array,
};

export default MotoTable;