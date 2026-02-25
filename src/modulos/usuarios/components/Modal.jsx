// Este componente define un modal genérico y reutilizable para la aplicación.
// Proporciona una estructura básica con un título, contenido y un botón de cierre.
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente de Modal genérico.
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal está abierto o cerrado.
 * @param {function} props.onClose - Función que se ejecuta al intentar cerrar el modal.
 * @param {string} props.title - El título que se mostrará en la cabecera del modal.
 * @param {React.ReactNode} props.children - El contenido que se renderizará dentro del cuerpo del modal.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Si el modal no está abierto, no renderiza nada.
  if (!isOpen) return null;

  return (
    // Contenedor principal del modal, fija su posición y lo centra en la pantalla.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro que cubre el fondo, permite cerrar el modal al hacer clic fuera. */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-70 transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose} // Cierra el modal al hacer clic en el overlay.
      ></div>

      {/* Contenedor del contenido del modal. */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300
                   w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
        role="dialog" // Define el rol ARIA para accesibilidad.
        aria-modal="true" // Indica que es un modal y bloquea el contenido subyacente.
        aria-labelledby="modal-title" // Asocia el título del modal para accesibilidad.
      >
        {/* Cabecera del modal con título y botón de cierre. */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          {/* Título del modal. */}
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {/* Botón para cerrar el modal. */}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
            onClick={onClose} // Llama a la función onClose al hacer clic.
            aria-label="Cerrar modal" // Etiqueta para accesibilidad.
          >
            {/* Icono de "X" para el botón de cierre. */}
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Cuerpo del modal donde se renderiza el contenido pasado como 'children'. */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Definición de PropTypes para validar las propiedades del componente Modal.
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // 'isOpen' debe ser un booleano y es requerido.
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerido.
  title: PropTypes.string.isRequired, // 'title' debe ser un string y es requerido.
  children: PropTypes.node.isRequired, // 'children' puede ser cualquier nodo renderizable y es requerido.
};

export default Modal;
