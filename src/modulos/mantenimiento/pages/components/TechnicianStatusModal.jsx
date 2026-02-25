// src/modulos/mantenimiento/pages/components/TechnicianStatusModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave, 
  faWrench,
  faMotorcycle,
  faUser,
  faCalendarAlt,
  faSpinner,
  faPlay,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Modal especializado para técnicos - cambiar estado de mantenimiento
 */
const TechnicianStatusModal = ({
  isOpen,
  onClose,
  mantenimiento,
  nuevoEstado,
  onConfirm,
  loading = false
}) => {
  const [observaciones, setObservaciones] = useState('');

  // Limpiar observaciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setObservaciones('');
    }
  }, [isOpen]);

  // Obtener información del cambio de estado
  const getStatusChangeInfo = () => {
    switch (nuevoEstado) {
      case 'en_proceso':
        return {
          icon: faPlay,
          color: 'blue',
          title: 'Iniciar Mantenimiento',
          description: 'Vas a marcar este mantenimiento como "En Proceso"',
          message: 'El mantenimiento aparecerá como en progreso y podrás trabajar en él.',
          required: false
        };
      case 'completado':
        return {
          icon: faCheck,
          color: 'green',
          title: 'Completar Mantenimiento',
          description: 'Vas a marcar este mantenimiento como "Completado"',
          message: 'El mantenimiento se marcará como finalizado. Asegúrate de haber agregado el diagnóstico y observaciones técnicas.',
          required: true
        };
      default:
        return {
          icon: faExclamationTriangle,
          color: 'yellow',
          title: 'Cambiar Estado',
          description: `Vas a cambiar el estado a "${nuevoEstado}"`,
          message: 'Se actualizará el estado del mantenimiento.',
          required: false
        };
    }
  };

  const statusInfo = getStatusChangeInfo();

  // Manejar confirmación
  const handleConfirm = () => {
    onConfirm(mantenimiento.id, nuevoEstado, observaciones);
  };

  // No renderizar si no está abierto
  if (!isOpen || !mantenimiento) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={statusInfo.icon} 
              className={`text-${statusInfo.color}-600 mr-3 h-6 w-6`} 
            />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {statusInfo.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {statusInfo.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Información del mantenimiento */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMotorcycle} className="text-blue-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.moto_info?.placa || 'N/A'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mantenimiento.moto_info?.marca} {mantenimiento.moto_info?.modelo}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-green-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.cliente_info?.nombre || 'N/A'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mantenimiento.cliente_info?.telefono}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.fecha_ingreso ? 
                    format(parseISO(mantenimiento.fecha_ingreso), 'dd/MM/yyyy', { locale: es }) : 
                    'N/A'
                  }
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Fecha de ingreso</p>
              </div>
            </div>
          </div>
          
          {/* Estado actual */}
          <div className="mt-4 p-3 bg-white dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              Estado actual: <span className="text-blue-600">{mantenimiento.estado}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nuevo estado: <span className={`text-${statusInfo.color}-600 font-medium`}>{nuevoEstado}</span>
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4">
          {/* Mensaje informativo */}
          <div className={`bg-${statusInfo.color}-50 dark:bg-${statusInfo.color}-900/20 p-4 rounded-lg`}>
            <p className={`text-sm text-${statusInfo.color}-800 dark:text-${statusInfo.color}-200`}>
              {statusInfo.message}
            </p>
          </div>

          {/* Observaciones opcionales */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Observaciones {statusInfo.required && '(Recomendado)'}
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              placeholder="Agrega observaciones sobre este cambio de estado (opcional)..."
              disabled={loading}
            />
          </div>

          {/* Advertencia para completado */}
          {nuevoEstado === 'completado' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-3 h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Antes de completar:
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• Verifica que hayas agregado el diagnóstico técnico</li>
                    <li>• Confirma que las observaciones estén completas</li>
                    <li>• Asegúrate de que el trabajo esté terminado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white bg-${statusInfo.color}-600 border border-transparent rounded-lg hover:bg-${statusInfo.color}-700 focus:ring-2 focus:ring-${statusInfo.color}-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
                Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={statusInfo.icon} className="mr-2 h-4 w-4" />
                Confirmar Cambio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

TechnicianStatusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
  nuevoEstado: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default TechnicianStatusModal;
