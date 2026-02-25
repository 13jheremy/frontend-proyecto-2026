// src/modulos/ventas/pages/components/PagoModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faCreditCard, 
  faMoneyBillWave,
  faExchangeAlt,
  faCalendarAlt,
  faUser,
  faFileInvoiceDollar,
  faExclamationTriangle,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { PAYMENT_METHODS, PAYMENT_METHOD_COLORS } from '../../../../utils/constants';

const PagoModal = ({ 
  isOpen, 
  onClose, 
  venta, 
  onConfirm,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    metodo: PAYMENT_METHODS.EFECTIVO,
    monto: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && venta) {
      // Pre-llenar con el saldo pendiente
      setFormData({
        metodo: PAYMENT_METHODS.EFECTIVO,
        monto: venta.saldo ? venta.saldo.toString() : ''
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

  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case PAYMENT_METHODS.EFECTIVO:
        return faMoneyBillWave;
      case PAYMENT_METHODS.TARJETA:
        return faCreditCard;
      case PAYMENT_METHODS.TRANSFERENCIA:
        return faExchangeAlt;
      default:
        return faDollarSign;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar monto
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    } else if (parseFloat(formData.monto) > parseFloat(venta.saldo || 0)) {
      newErrors.monto = `El monto no puede exceder el saldo pendiente de ${formatearPrecio(venta.saldo)}`;
    }

    // Validar método
    if (!formData.metodo) {
      newErrors.metodo = 'Debe seleccionar un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const pagoData = {
      venta: venta.id,
      metodo: formData.metodo,
      monto: parseFloat(formData.monto)
    };

    await onConfirm(pagoData);
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

  const saldoPendiente = parseFloat(venta.saldo || 0);
  const totalPagado = parseFloat(venta.pagado || 0);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Registrar Pago"
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
                  <span className="text-gray-500 dark:text-gray-400">Total venta:</span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatearPrecio(venta.total)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total pagado:</span>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {formatearPrecio(totalPagado)}
                  </p>
                </div>
              </div>
              
              {/* Saldo pendiente destacado */}
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Saldo pendiente: {formatearPrecio(saldoPendiente)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="space-y-4">
          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('metodo', value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.metodo === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={getMetodoIcon(value)} 
                      className={`h-5 w-5 ${
                        formData.metodo === value 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />
                    <span className={`text-sm font-medium ${
                      formData.metodo === value 
                        ? 'text-blue-900 dark:text-blue-200' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {errors.metodo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.metodo}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto a pagar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Bs.</span>
              </div>
              <input
                type="number"
                id="monto"
                step="0.01"
                min="0.01"
                max={saldoPendiente}
                value={formData.monto}
                onChange={(e) => handleChange('monto', e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.monto 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.monto && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.monto}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Máximo: {formatearPrecio(saldoPendiente)}
            </p>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleChange('monto', (saldoPendiente / 2).toFixed(2))}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handleChange('monto', saldoPendiente.toFixed(2))}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Pago completo
            </button>
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
                Registrando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                Registrar Pago
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

PagoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  venta: PropTypes.shape({
    id: PropTypes.number.isRequired,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    pagado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    saldo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cliente_nombre: PropTypes.string,
    fecha_venta: PropTypes.string
  }),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default PagoModal;
