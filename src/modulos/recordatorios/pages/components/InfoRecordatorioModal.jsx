// src/modules/recordatorios/pages/components/InfoRecordatorioModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClock, faCalendar, faMotorcycle, faTag, faInfoCircle, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { formatRecordatorioStatus } from '../../utils/recordatorioUtils';

const InfoRecordatorioModal = ({ isOpen, onClose, recordatorio }) => {
  if (!isOpen || !recordatorio) return null;

  const status = formatRecordatorioStatus(recordatorio.enviado, recordatorio.fecha_programada);

  const getStatusIcon = () => {
    switch (status.status) {
      case 'completado':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />;
      case 'vencido':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />;
      case 'urgente':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600 text-2xl" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-blue-600 text-2xl" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'urgente':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detalles del Recordatorio de Mantenimiento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</span>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor()}`}>
              {status.text}
            </span>
          </div>

          {/* Servicio */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {recordatorio.categoria_servicio?.nombre || 'Servicio de mantenimiento'}
            </h4>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faTag} className="mr-2" />
              Categoría ID: {recordatorio.categoria_servicio?.id || 'N/A'}
            </div>
          </div>

          {/* Información del Servicio */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información del Servicio
            </h5>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              Recordatorio de mantenimiento programado para la fecha indicada.
            </p>
          </div>

          {/* Información en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha programada */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                <span className="text-sm font-medium">Fecha Programada</span>
              </div>
              <div className="text-gray-900 dark:text-white">
                <div className="text-lg font-semibold">
                  {new Date(recordatorio.fecha_programada).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(recordatorio.fecha_programada).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Información de la moto */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <FontAwesomeIcon icon={faMotorcycle} className="mr-2" />
                <span className="text-sm font-medium">Moto</span>
              </div>
              <div className="text-gray-900 dark:text-white">
                <div className="text-lg font-semibold">
                  {recordatorio.moto?.placa || 'Sin placa'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {recordatorio.moto?.marca} {recordatorio.moto?.modelo} ({recordatorio.moto?.año})
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Propietario: {recordatorio.moto?.propietario_nombre || 'Sin propietario'}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Información Adicional
            </h5>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">ID:</span>
                <div className="font-medium text-gray-900 dark:text-white">#{recordatorio.id}</div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Enviado:</span>
                <div className={`font-medium ${recordatorio.enviado ? 'text-green-600' : 'text-blue-600'}`}>
                  {recordatorio.enviado ? 'Sí' : 'No'}
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Próximo:</span>
                <div className={`font-medium ${recordatorio.es_proximo ? 'text-orange-600' : 'text-gray-600'}`}>
                  {recordatorio.es_proximo ? 'Sí' : 'No'}
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {recordatorio.categoria_servicio?.id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Fechas de auditoría */}
          {(recordatorio.fecha_registro || recordatorio.fecha_actualizacion) && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Fechas de Registro
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {recordatorio.fecha_registro && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Creado:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(recordatorio.fecha_registro).toLocaleString('es-ES')}
                    </div>
                  </div>
                )}

                {recordatorio.fecha_actualizacion && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Actualizado:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(recordatorio.fecha_actualizacion).toLocaleString('es-ES')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoRecordatorioModal;