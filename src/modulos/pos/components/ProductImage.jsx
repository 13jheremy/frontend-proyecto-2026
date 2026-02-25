// src/modulos/pos/components/ProductImage.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faExpand } from '@fortawesome/free-solid-svg-icons';
import ProductoImageModal from '../../productos/pages/components/ProductoImageModal';

const ProductImage = ({ 
  imageUrl, 
  productName, 
  size = 'small', 
  showExpandIcon = false,
  className = '',
  onClick = null 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const handleImageClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div 
        className={`${sizeClasses[size]} relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ${className} ${(imageUrl && !imageError) || showExpandIcon ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      >
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={productName || 'Producto'}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            {showExpandIcon && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faExpand} 
                  className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200" 
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faImage} 
              className="text-gray-400 dark:text-gray-500 text-lg" 
            />
          </div>
        )}
      </div>

      {/* Modal para imagen completa */}
      <ProductoImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        productName={productName}
      />
    </>
  );
};

ProductImage.propTypes = {
  imageUrl: PropTypes.string,
  productName: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showExpandIcon: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default ProductImage;
