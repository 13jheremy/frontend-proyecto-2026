// src/modulos/ventas/pages/components/VentaEditEstadoModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faCreditCard, 
  faMoneyBillWave,
  faExchangeAlt,
  faCalendarAlt,
  faUser,
  faFileInvoiceDollar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const VentaEditEstadoModal = ({ 
  isOpen, 
  onClose, 
  venta, 
  onConfirm,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    estado: 'PENDIENTE',
    metodo_pago: 'EFECTIVO'
  });
  const [errors, setErrors] = useState({});

  // Estados disponibles para ventas (deben coincidir con el modelo backend)
  const estadosVenta = [
    { value: 'PENDIENTE', label: 'Pendiente', icon: faClock, color: 'yellow' },
    { value: 'PAGADA', label: 'Pagada', icon: faCheckCircle, color: 'green' },
    { value: 'ANULADA', label: 'Anulada', icon: faTimesCircle, color: 'red' }
  ];

  // Métodos de pago disponibles
  const metodosPago = [
    { value: 'EFECTIVO', label: 'Efectivo', icon: faMoneyBillWave },
    { value: 'TARJETA', label: 'Tarjeta', icon: faCreditCard },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: faExchangeAlt },
    { value: 'OTRO', label: 'Otro', icon: faCreditCard }
  ];

  useEffect(() => {
    if (isOpen && venta) {
      setFormData({
        estado: venta.estado || 'PENDIENTE',
        metodo_pago: venta.metodo_pago || 'EFECTIVO'
      });
      setErrors({});
    }
  }, [isOpen, venta]);

  const formatearPrecio = (precio) => {
    return `Bs. ${parseFloat(precio || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoConfig = (estado) => {
    return estadosVenta.find(e => e.value === estado) || estadosVenta[0];
  };

  const getMetodoConfig = (metodo) => {
    return metodosPago.find(m => m.value === metodo) || metodosPago[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.estado) {
      newErrors.estado = 'Debe seleccionar un estado';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Debe seleccionar un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updateData = {
      estado: formData.estado,
      metodo_pago: formData.metodo_pago
    };

    await onConfirm(venta.id, updateData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen || !venta) return null;

  const estadoActual = getEstadoConfig(venta.estado);
  const metodoActual = getMetodoConfig(venta.metodo_pago);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Editar Estado y Método de Pago"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la venta */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Venta #{venta.id}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {venta.cliente_nombre || 'Sin cliente'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 h-3 w-3" />
                    {formatearFecha(venta.fecha_venta)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatearPrecio(venta.total)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Estado actual:</span>
                  <p className="font-medium flex items-center">
                    <FontAwesomeIcon 
                      icon={estadoActual.icon} 
                      className={`mr-1 h-3 w-3 text-${estadoActual.color}-600`} 
                    />
                    <span className={`text-${estadoActual.color}-600`}>
                      {estadoActual.label}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="space-y-6">
          {/* Estado de la venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Estado de la venta
            </label>
            <div className="grid grid-cols-1 gap-3">
              {estadosVenta.map((estado) => (
                <button
                  key={estado.value}
                  type="button"
                  onClick={() => handleChange('estado', estado.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    formData.estado === estado.value
                      ? `border-${estado.color}-500 bg-${estado.color}-50 dark:bg-${estado.color}-900/20`
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon 
                      icon={estado.icon} 
                      className={`h-5 w-5 ${
                        formData.estado === estado.value 
                          ? `text-${estado.color}-600 dark:text-${estado.color}-400` 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />
                    <div>
                      <span className={`text-sm font-medium ${
                        formData.estado === estado.value 
                          ? `text-${estado.color}-900 dark:text-${estado.color}-200` 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {estado.label}
                      </span>
                      <p className={`text-xs ${
                        formData.estado === estado.value 
                          ? `text-${estado.color}-700 dark:text-${estado.color}-300` 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {estado.value === 'PENDIENTE' && 'La venta está pendiente de pago'}
                        {estado.value === 'PAGADA' && 'La venta ha sido pagada completamente'}
                        {estado.value === 'ANULADA' && 'La venta ha sido cancelada'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estado}</p>
            )}
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              {metodosPago.map((metodo) => (
                <button
                  key={metodo.value}
                  type="button"
                  onClick={() => handleChange('metodo_pago', metodo.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.metodo_pago === metodo.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={metodo.icon} 
                      className={`h-5 w-5 ${
                        formData.metodo_pago === metodo.value 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />
                    <span className={`text-sm font-medium ${
                      formData.metodo_pago === metodo.value 
                        ? 'text-blue-900 dark:text-blue-200' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {metodo.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {errors.metodo_pago && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.metodo_pago}</p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

VentaEditEstadoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  venta: PropTypes.shape({
    id: PropTypes.number.isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    estado: PropTypes.string,
    metodo_pago: PropTypes.string,
    cliente_nombre: PropTypes.string,
    fecha_venta: PropTypes.string
  }),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default VentaEditEstadoModal;
