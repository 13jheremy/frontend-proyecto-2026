// Este componente proporciona una interfaz de búsqueda y filtrado para la tabla de usuarios.
// Incluye un campo de búsqueda principal y filtros avanzados colapsables.

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons'; // Iconos para búsqueda, filtro y limpiar.

const UsuarioSearch = ({ filters, setFilters, onSearch, rolesDisponibles = [] }) => {
  // Estado para controlar la visibilidad de los filtros avanzados.
  const [showAdvanced, setShowAdvanced] = useState(false);

  // debounce: Función de utilidad para retrasar la ejecución de una función.
  // Esto es útil para evitar llamadas excesivas a la API mientras el usuario escribe.
  const debounce = (func, wait) => {
    let timeout; // Variable para almacenar el ID del temporizador.
    return (...args) => {
      clearTimeout(timeout); // Limpia cualquier temporizador anterior.
      timeout = setTimeout(() => func(...args), wait); // Establece un nuevo temporizador.
    };
  };

  // debouncedSearch: Versión "debounced" de la función 'onSearch'.
  // Se ejecutará solo después de que el usuario deje de escribir por un corto período.
  const debouncedSearch = useCallback(
    debounce((searchFilters) => {
      onSearch(searchFilters); // Llama a la función de búsqueda principal.
    }, 300), // Espera 300 milisegundos.
    [onSearch] // Dependencia: se recrea si 'onSearch' cambia.
  );

  // handleInputChange: Maneja los cambios en los campos de entrada de los filtros.
  const handleInputChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }; // Crea un nuevo objeto de filtros con el valor actualizado.
    setFilters(newFilters); // Actualiza el estado local de los filtros.

    // Si el cambio es en el campo de búsqueda principal, usa la función debounced.
    if (name === 'search') {
      debouncedSearch(newFilters);
    } else {
      // Para otros filtros, ejecuta la búsqueda inmediatamente.
      onSearch(newFilters);
    }
  };

  // handleRoleChange: Maneja los cambios en la selección de roles (checkboxes).
  const handleRoleChange = (roleId) => {
    const currentRoles = filters.roles || []; // Obtiene los roles actualmente seleccionados o un array vacío.
    let newRoles;

    // Verifica si el rol ya está incluido en la selección actual.
    if (currentRoles.includes(Number(roleId))) {
      // Si está incluido, lo elimina de la lista.
      newRoles = currentRoles.filter(id => id !== Number(roleId));
    } else {
      // Si no está incluido, lo añade a la lista.
      newRoles = [...currentRoles, Number(roleId)];
    }

    const newFilters = { ...filters, roles: newRoles }; // Actualiza los filtros con la nueva selección de roles.
    setFilters(newFilters); // Actualiza el estado local de los filtros.
    onSearch(newFilters); // Ejecuta la búsqueda con los nuevos filtros.
  };

  // handleClearFilters: Restablece todos los filtros a su estado inicial (vacío).
  const handleClearFilters = () => {
    const clearedFilters = {}; // Objeto vacío para limpiar todos los filtros.
    setFilters(clearedFilters); // Actualiza el estado local de los filtros a vacío.
    onSearch(clearedFilters); // Ejecuta la búsqueda con los filtros vacíos.
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Campo de búsqueda principal */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por usuario, nombre, apellido o correo..."
              value={filters?.search || ''} // Valor del input, usa una cadena vacía si no hay filtro.
              onChange={(e) => handleInputChange('search', e.target.value)} // Maneja los cambios en el input.
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            {/* Icono de búsqueda dentro del input. */}
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Botón para mostrar/ocultar filtros avanzados */}
        <div className="col-span-1">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)} // Alterna la visibilidad de los filtros avanzados.
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            {showAdvanced ? 'Ocultar' : 'Filtros'} {/* Cambia el texto del botón según la visibilidad. */}
          </button>
        </div>

        {/* Botón para limpiar todos los filtros */}
        <div className="col-span-1">
          <button
            onClick={handleClearFilters} // Llama a la función para limpiar filtros.
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Sección de filtros avanzados, visible solo si 'showAdvanced' es true. */}
      {showAdvanced && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filtro por Estado del usuario (Activo/Inactivo) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado del Usuario
              </label>
              <select
                value={filters?.is_active !== undefined ? String(filters.is_active) : ''} // Valor seleccionado.
                onChange={(e) => handleInputChange('is_active', e.target.value)} // Maneja los cambios.
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            {/* Filtro por Estado de Eliminación (Eliminados temporalmente/No eliminados) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado de Eliminación
              </label>
              <select
                value={filters?.eliminado !== undefined ? String(filters.eliminado) : ''} // Valor seleccionado.
                onChange={(e) => handleInputChange('eliminado', e.target.value)} // Maneja los cambios.
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos</option>
                <option value="false">No Eliminados</option>
                <option value="true">Eliminados Temporalmente</option>
              </select>
            </div>

            {/* Filtro por Fecha de registro (Desde) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registrado Desde
              </label>
              <input
                type="date"
                value={filters?.fecha_registro_desde || ''} // Valor del input.
                onChange={(e) => handleInputChange('fecha_registro_desde', e.target.value)} // Maneja los cambios.
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Filtro por Fecha de registro (Hasta) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registrado Hasta
              </label>
              <input
                type="date"
                value={filters?.fecha_registro_hasta || ''} // Valor del input.
                onChange={(e) => handleInputChange('fecha_registro_hasta', e.target.value)} // Maneja los cambios.
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filtro por roles (checkboxes) */}
          {rolesDisponibles && rolesDisponibles.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Filtrar por Roles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {rolesDisponibles.map((role) => (
                  <div key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-filter-${role.id}`} // ID único para el checkbox.
                      checked={filters?.roles?.includes(role.id) || false} // Determina si el rol está seleccionado.
                      onChange={() => handleRoleChange(role.id)} // Maneja el cambio de estado del checkbox.
                      className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-600"
                    />
                    <label
                      htmlFor={`role-filter-${role.id}`} // Asocia la etiqueta al checkbox.
                      className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer"
                    >
                      {role.nombre} {/* Muestra el nombre del rol. */}
                    </label>
                  </div>
                ))}
              </div>
              {filters?.roles && filters.roles.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  {filters.roles.length} rol(es) seleccionado(s) {/* Muestra cuántos roles están seleccionados. */}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Definición de PropTypes para validar las propiedades del componente UsuarioSearch.
UsuarioSearch.propTypes = {
  filters: PropTypes.object, // 'filters' debe ser un objeto.
  setFilters: PropTypes.func.isRequired, // 'setFilters' debe ser una función y es requerido.
  onSearch: PropTypes.func.isRequired, // 'onSearch' debe ser una función y es requerido.
  rolesDisponibles: PropTypes.arrayOf( // 'rolesDisponibles' debe ser un array de objetos con:
    PropTypes.shape({
      id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
      nombre: PropTypes.string.isRequired, // 'nombre' debe ser un string y es requerido.
    })
  ), // 'rolesDisponibles' es opcional.
};


export default UsuarioSearch;
