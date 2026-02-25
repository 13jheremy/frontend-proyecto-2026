// src/modules/usuarios/components/UsuarioInfoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faUser, 
  faIdCard, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faCheckCircle, 
  faTimesCircle, 
  faCalendarAlt,
  faUserTag,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';

const UsuarioInfoModal = ({ isOpen, onClose, usuario = null, allRoles }) => {
  if (!isOpen || !usuario) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener los nombres de los roles
  const getRoleNames = (rolesArray) => {
    if (!rolesArray || !Array.isArray(rolesArray) || rolesArray.length === 0) {
      return 'Sin Roles';
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

    return roleNames || 'Roles no encontrados';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Usuario: ${usuario.username}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de usuario principal */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faUser} size="2x" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{usuario.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
              {usuario.correo_electronico}
            </p>
            {usuario.is_staff && (
              <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center">
                <FontAwesomeIcon icon={faUserShield} className="mr-1" />
                Administrador del Sistema
              </p>
            )}
          </div>
        </div>

        {/* Información Personal */}
        {usuario.persona && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Completo */}
              {usuario.persona.nombre_completo && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-semibold flex items-center">
                    <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
                    Nombre Completo:
                  </p>
                  <p className="ml-6">{usuario.persona.nombre_completo}</p>
                </div>
              )}

              {/* Cédula */}
              {usuario.persona.cedula && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-semibold flex items-center">
                    <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
                    Cédula:
                  </p>
                  <p className="ml-6">{usuario.persona.cedula}</p>
                </div>
              )}

              {/* Teléfono */}
              {usuario.persona.telefono && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-semibold flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
                    Teléfono:
                  </p>
                  <p className="ml-6">{usuario.persona.telefono}</p>
                </div>
              )}

              {/* Dirección */}
              {usuario.persona.direccion && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg md:col-span-2">
                  <p className="font-semibold flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" />
                    Dirección:
                  </p>
                  <p className="ml-6 whitespace-pre-wrap">{usuario.persona.direccion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roles */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="font-semibold flex items-center">
            <FontAwesomeIcon icon={faUserTag} className="mr-2 text-green-500" />
            Roles:
          </p>
          <p className="ml-6">{getRoleNames(usuario.roles)}</p>
        </div>

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {usuario.is_active ? <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />}
              Estado:
            </p>
            <p className="ml-6">{usuario.is_active ? 'Activo' : 'Inactivo'}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {usuario.eliminado ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />}
              Eliminado:
            </p>
            <p className="ml-6">{usuario.eliminado ? 'Sí' : 'No'}</p>
          </div>
          
          {usuario.date_joined && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Fecha de Registro:
              </p>
              <p className="ml-6">{formatDate(usuario.date_joined)}</p>
            </div>
          )}
          
          {usuario.last_login && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Último Acceso:
              </p>
              <p className="ml-6">{formatDate(usuario.last_login)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

UsuarioInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  usuario: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    correo_electronico: PropTypes.string.isRequired,
    is_active: PropTypes.bool,
    is_staff: PropTypes.bool,
    eliminado: PropTypes.bool,
    roles: PropTypes.array,
    persona: PropTypes.shape({
      nombre_completo: PropTypes.string,
      cedula: PropTypes.string,
      telefono: PropTypes.string,
      direccion: PropTypes.string,
    }),
    date_joined: PropTypes.string,
    last_login: PropTypes.string,
  }),
  allRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
};


export default UsuarioInfoModal;
