// src/components/ProductoImageModal.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faExpand } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para mostrar la imagen del producto en tamaño completo.
 */
const ProductoImageModal = ({ isOpen, onClose, imageUrl, productName }) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${productName || 'producto'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      {/* Overlay con blur */}
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true"></div>
      
      {/* Contenido del modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full flex flex-col overflow-hidden">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faExpand} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {productName || 'Imagen del Producto'}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botón de descarga */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              title="Descargar imagen"
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
            
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              title="Cerrar modal"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>

        {/* Contenedor de la imagen */}
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800">
          <div className="relative max-w-full max-h-full">
            <img
              src={imageUrl}
              alt={productName || 'Producto'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = '/images/placeholder-image.png'; // Ruta corregida
                e.target.onerror = null;
              }}
            />
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Haz clic fuera de la imagen o presiona ESC para cerrar
          </p>
        </div>
      </div>
    </div>
  );
};

ProductoImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string,
  productName: PropTypes.string,
};

ProductoImageModal.defaultProps = {
  imageUrl: null,
  productName: '',
};

export default ProductoImageModal;
