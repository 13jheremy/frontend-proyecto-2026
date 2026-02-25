import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Dropdown } from 'react-bootstrap';

/**
 * Componente para exportar datos en diferentes formatos
 */
const ExportButton = ({ onExport, loading = false, disabled = false, className = '' }) => {
  const handleExport = (format) => {
    if (onExport && typeof onExport === 'function') {
      onExport(format);
    }
  };

  return (
    <Dropdown className={`d-inline-block ${className}`}>
      <Dropdown.Toggle 
        variant="outline-secondary" 
        id="export-dropdown"
        disabled={disabled || loading}
        className="d-flex align-items-center"
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            Exportando...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faFileExport} className="me-2" />
            Exportar
          </>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleExport('csv')}>
          Exportar a CSV
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleExport('excel')}>
          Exportar a Excel
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleExport('pdf')}>
          Exportar a PDF
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

ExportButton.propTypes = {
  /**
   * Función que se ejecuta al seleccionar un formato de exportación
   * Recibe como parámetro el formato seleccionado ('csv', 'excel', 'pdf')
   */
  onExport: PropTypes.func,
  
  /**
   * Indica si el botón está en estado de carga
   */
  loading: PropTypes.bool,
  
  /**
   * Indica si el botón está deshabilitado
   */
  disabled: PropTypes.bool,
  
  /**
   * Clases CSS adicionales
   */
  className: PropTypes.string,
};

export default ExportButton;
