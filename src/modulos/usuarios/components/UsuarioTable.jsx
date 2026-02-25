// Este componente renderiza una tabla de usuarios con sus detalles y acciones disponibles.
// Incluye manejo de estados de carga y ausencia de datos, y muestra roles y estados.

import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faTrash, faKey, faUserCheck, faUserTimes, faRecycle, faTrashRestore,
  faInfoCircle, faUser, faEnvelope, faUserTag, faIdCard, faPhone,
  faCheckCircle, faBan, faUserPlus
} from '@fortawesome/free-solid-svg-icons';

const UsuarioTable = ({
  users,
  allRoles,
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onResetPassword,
  onToggleStatus,
  onInfo,
  loading,
  // Nuevas props para control de permisos
  permissions = {},
  canViewUser = null,
  canEditUser = null,
  canDeleteUser = null,
  canToggleUserStatus = null,
  canResetUserPassword = null
}) => {
  // Muestra un mensaje de carga si 'loading' es true.
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando usuarios...
      </div>
    );
  }

  // Muestra un mensaje si no se encontraron usuarios o la lista está vacía.
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faUser} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron usuarios.
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comienza creando tu primer usuario o ajusta los filtros de búsqueda.
        </p>
      </div>
    );
  }

  // getRoleNames: Función auxiliar para obtener los nombres de los roles de un usuario.
  const getRoleNames = (rolesArray) => {
    if (!rolesArray || !Array.isArray(rolesArray) || rolesArray.length === 0) {
      return <span className="text-red-500 font-medium">Sin Roles</span>;
    }

    const roleNames = rolesArray
      .map((role) => {
        if (typeof role === 'object' && role.nombre) {
          return role.nombre;
        }
        if (typeof role === 'number') {
          const foundRole = allRoles.find((r) => r.id === role);
          return foundRole ? foundRole.nombre : null;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');

    return roleNames || <span className="text-red-500 font-medium">Roles no encontrados</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <colgroup>
          <col className="w-1/3" />
          <col className="w-1/3" />
          <col className="w-1/6" />
          <col className="w-32" />
          <col className="w-48" />
        </colgroup>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Persona
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Roles
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              {/* Celda: Usuario */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full ${
                      user.es_persona_sin_usuario 
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }`}>
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.es_persona_sin_usuario ? 'Persona sin usuario' : user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-1 h-3 w-3 text-purple-500" />
                      {user.email || user.correo_electronico || 'No especificado'}
                    </div>
                    {user.es_persona_sin_usuario && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        Sin acceso al sistema
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Celda: Información Personal */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {user.es_persona_sin_usuario ? (
                    <>
                      <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <FontAwesomeIcon icon={faIdCard} className="mr-1 h-3 w-3 text-gray-500" />
                        {user.persona_asociada?.nombre} {user.persona_asociada?.apellido}
                      </div>
                      {user.persona_asociada?.cedula && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faIdCard} className="mr-1 h-3 w-3 text-blue-500" />
                          CC: {user.persona_asociada.cedula}
                        </div>
                      )}
                      {user.persona_asociada?.telefono && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faPhone} className="mr-1 h-3 w-3 text-orange-500" />
                          {user.persona_asociada.telefono}
                        </div>
                      )}
                    </>
                  ) : user.persona?.nombre_completo ? (
                    <>
                      <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <FontAwesomeIcon icon={faIdCard} className="mr-1 h-3 w-3 text-gray-500" />
                        {user.persona.nombre_completo}
                      </div>
                      {user.persona.telefono && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faPhone} className="mr-1 h-3 w-3 text-orange-500" />
                          {user.persona.telefono}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-red-500 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                      Sin Persona
                    </span>
                  )}
                </div>
              </td>

              {/* Celda: Roles */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserTag} className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {user.es_persona_sin_usuario ? (
                      <span className="text-orange-500 font-medium">Sin roles asignados</span>
                    ) : (
                      getRoleNames(user.roles)
                    )}
                  </span>
                </div>
              </td>

              {/* Celda: Estado */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                {user.es_persona_sin_usuario ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                    Sin Usuario
                  </span>
                ) : user.eliminado ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                    Eliminado
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <FontAwesomeIcon 
                      icon={user.is_active ? faCheckCircle : faBan} 
                      className="mr-1 h-3 w-3" 
                    />
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </td>

              {/* Celda: Acciones */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center space-x-2">
                  {user.es_persona_sin_usuario ? (
                    // Acciones para personas sin usuario
                    <>
                      {/* Botón INFORMACIÓN */}
                      {(!canViewUser || canViewUser(user)) && (
                        <button
                          onClick={() => onInfo && onInfo(user)}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                          title="Información de la persona"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      )}
                      
                      {/* Botón CREAR USUARIO */}
                      {(!canEditUser || canEditUser(user)) && (
                        <button
                          onClick={() => onEdit && onEdit(user)}
                          className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                          title="Crear usuario para esta persona"
                        >
                          <FontAwesomeIcon icon={faToggleOn} className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    // Acciones para usuarios normales
                    <>
                      {/* Botón EDITAR */}
                      {(!canEditUser || canEditUser(user)) && (
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                          title="Editar usuario"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                        </button>
                      )}

                      {/* Botón INFORMACIÓN */}
                      {(!canViewUser || canViewUser(user)) && (
                        <button
                          onClick={() => onInfo && onInfo(user)}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                          title="Información del usuario"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      )}

                      {/* Botón CAMBIAR ESTADO */}
                      {!user.eliminado && (!canToggleUserStatus || canToggleUserStatus(user)) && (
                        <button
                          onClick={() => onToggleStatus(user.id, !user.is_active)}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            user.is_active
                              ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                          }`}
                          title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <FontAwesomeIcon icon={user.is_active ? faUserTimes : faUserCheck} />
                        </button>
                      )}

                      {/* Botón RESETEAR CONTRASEÑA */}
                      {(!canResetUserPassword || canResetUserPassword(user)) && (
                        <button
                          onClick={() => onResetPassword(user)}
                          className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors duration-200"
                          title="Restablecer contraseña"
                        >
                          <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
                        </button>
                      )}

                      {/* Botones de ELIMINACIÓN */}
                      {user.eliminado ? (
                        <>
                          {/* Botón RESTAURAR - Solo administradores */}
                          {permissions.canRestore && (
                            <button
                              onClick={() => onRestore(user.id)}
                              className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                              title="Restaurar usuario"
                            >
                              <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                            </button>
                          )}

                          {/* Botón ELIMINAR PERMANENTEMENTE - Solo administradores */}
                          {permissions.canHardDelete && (
                            <button
                              onClick={() => onHardDelete(user.id)}
                              className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                              title="Eliminar permanentemente"
                            >
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        /* Botón ELIMINAR TEMPORALMENTE */
                        (!canDeleteUser || canDeleteUser(user)) && (
                          <button
                            onClick={() => onSoftDelete(user.id)}
                            className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                            title="Eliminar temporalmente"
                          >
                            <FontAwesomeIcon icon={faRecycle} className="h-4 w-4" />
                          </button>
                        )
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

// PropTypes
UsuarioTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      username: PropTypes.string,
      correo_electronico: PropTypes.string,
      email: PropTypes.string,
      is_active: PropTypes.bool,
      eliminado: PropTypes.bool,
      es_persona_sin_usuario: PropTypes.bool,
      roles: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          id: PropTypes.number,
          nombre: PropTypes.string,
          activo: PropTypes.bool
        })
      ])),
      persona: PropTypes.shape({
        nombre_completo: PropTypes.string,
        telefono: PropTypes.string,
      }),
      persona_asociada: PropTypes.shape({
        nombre: PropTypes.string,
        apellido: PropTypes.string,
        cedula: PropTypes.string,
        telefono: PropTypes.string,
        email: PropTypes.string,
      }),
      date_joined: PropTypes.string,
      fecha_creacion: PropTypes.string,
    })
  ).isRequired,
  allRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onSoftDelete: PropTypes.func.isRequired,
  onHardDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onResetPassword: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onInfo: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  permissions: PropTypes.shape({
    canCreate: PropTypes.bool,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canView: PropTypes.bool,
  }),
  canViewUser: PropTypes.func,
  canEditUser: PropTypes.func,
  canDeleteUser: PropTypes.func,
  canToggleUserStatus: PropTypes.func,
  canResetUserPassword: PropTypes.func,
};

export default UsuarioTable;