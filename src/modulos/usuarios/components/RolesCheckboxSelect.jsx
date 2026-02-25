// Este componente permite seleccionar UN SOLO rol mediante radio buttons.
// Es reutilizable y muestra una lista de roles disponibles para que el usuario elija uno.
import React from 'react';
import PropTypes from 'prop-types';

const RolesCheckboxSelect = ({ label, rolesDisponibles, selectedRoles, onChange, disabled }) => {
  // getSelectedRole: Función auxiliar para obtener el rol seleccionado (solo uno).
  // Retorna el primer rol del array selectedRoles o null si no hay ninguno.
  const getSelectedRole = () => selectedRoles && selectedRoles.length > 0 ? selectedRoles[0] : null;

  // handleRoleChange: Maneja el cambio de selección de rol.
  // Reemplaza el rol seleccionado con el nuevo rol elegido.
  const handleRoleChange = (role) => {
    // Siempre reemplaza con el nuevo rol seleccionado (array de un solo elemento)
    onChange([role]);
  };

  return (
    <div className="flex flex-col">
      {/* Etiqueta para el grupo de checkboxes, si se proporciona. */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {/* Contenedor de los radio buttons, organizado en una cuadrícula. */}
      <div className="grid grid-cols-2 gap-2">
        {/* Mapea sobre la lista de roles disponibles para crear un radio button para cada uno. */}
        {rolesDisponibles && rolesDisponibles.map((role) => {
          const selectedRole = getSelectedRole();
          return (
            <div key={role.id} className="flex items-center">
              <input
                type="radio"
                id={`role-${role.id}`} // ID único para el radio button.
                name="roles" // Nombre del grupo de radio buttons.
                value={role.id} // Valor del radio button (ID del rol).
                checked={selectedRole && selectedRole.id === role.id} // Determina si el radio button está marcado.
                onChange={() => handleRoleChange(role)} // Maneja el cambio de estado.
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={disabled} // Deshabilita el radio button si la prop 'disabled' es true.
              />
              {/* Etiqueta asociada al radio button para mejorar la accesibilidad. */}
              <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                {role.nombre} {/* Muestra el nombre del rol. */}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Definición de PropTypes para validar las propiedades del componente RolesCheckboxSelect.
RolesCheckboxSelect.propTypes = {
  label: PropTypes.string.isRequired, // 'label' debe ser un string y es requerido.
  rolesDisponibles: PropTypes.arrayOf( // 'rolesDisponibles' debe ser un array de objetos con:
    PropTypes.shape({
      id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
      nombre: PropTypes.string.isRequired, // 'nombre' debe ser un string y es requerido.
    })
  ).isRequired, // 'rolesDisponibles' es requerido.
  selectedRoles: PropTypes.arrayOf( // 'selectedRoles' debe ser un array con máximo un objeto de rol:
    PropTypes.shape({
      id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
      nombre: PropTypes.string.isRequired, // 'nombre' debe ser un string y es requerido.
    })
  ).isRequired, // 'selectedRoles' es requerido (array de 0 o 1 elemento).
  onChange: PropTypes.func.isRequired, // 'onChange' debe ser una función y es requerido.
  disabled: PropTypes.bool.isRequired, // 'disabled' debe ser un booleano y es requerido.
};

export default RolesCheckboxSelect;
