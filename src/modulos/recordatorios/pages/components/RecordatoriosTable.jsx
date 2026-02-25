// src/modules/recordatorios/pages/components/RecordatoriosTable.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faInfoCircle,
  faCheck,
  faClock,
  faExclamationTriangle,
  faToggleOn,
  faToggleOff,
  faUndo,
  faTrashRestore,
  faRecycle
} from '@fortawesome/free-solid-svg-icons';
import { formatRecordatorioStatus } from '../../utils/recordatorioUtils';

const RecordatoriosTable = ({
  recordatorios,
  permissions,
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onToggleActivo,
  onMarcarEnviado,
  onMarcarPendiente,
  onInfo,
  loading
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Cargando recordatorios...</span>
        </div>
      </div>
    );
  }

  if (!recordatorios || recordatorios.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <FontAwesomeIcon icon={faClock} className="text-4xl mb-4 opacity-50" />
        <p className="text-lg">No hay recordatorios registrados</p>
        <p className="text-sm">Crea tu primer recordatorio para comenzar</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status.status) {
      case 'completado':
        return <FontAwesomeIcon icon={faCheck} className="text-green-600" />;
      case 'vencido':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />;
      case 'urgente':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-blue-600" />;
    }
  };

  const getStatusBadge = (recordatorio) => {
    const status = formatRecordatorioStatus(recordatorio.enviado, recordatorio.fecha_programada);
    const colorClasses = {
      completado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      vencido: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      urgente: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      proximo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pendiente: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${colorClasses[status.status] || colorClasses.pendiente}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status.text}</span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Servicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Moto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Fecha Programada
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Enviado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {recordatorios.map((recordatorio) => (
            <tr key={recordatorio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {recordatorio.categoria_servicio?.nombre || 'Servicio de mantenimiento'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Recordatorio de mantenimiento
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {recordatorio.moto?.placa || 'Sin placa'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {recordatorio.moto?.marca} {recordatorio.moto?.modelo} ({recordatorio.moto?.año})
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(recordatorio.fecha_programada).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(recordatorio)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  recordatorio.enviado
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {recordatorio.enviado ? 'ENVIADO' : 'PENDIENTE'}
                </span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">

                  {/* Botón INFORMACIÓN */}
                  <button
                    onClick={() => onInfo && onInfo(recordatorio)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                    title="Información del recordatorio"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                  </button>

                  {/* Botón EDITAR */}
                  {permissions.canEdit && (
                    <button
                      onClick={() => onEdit(recordatorio)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                      title="Editar recordatorio"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón ACTIVAR/DESACTIVAR */}
                  {!recordatorio.eliminado && permissions.canToggleActive && (
                    <button
                      onClick={() => onToggleActivo && onToggleActivo(recordatorio.id, recordatorio.activo)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        recordatorio.activo
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                          : 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                      }`}
                      title={recordatorio.activo ? 'Desactivar recordatorio' : 'Activar recordatorio'}
                    >
                      <FontAwesomeIcon icon={recordatorio.activo ? faToggleOn : faToggleOff} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Botón MARCAR ENVIADO/PENDIENTE */}
                  {!recordatorio.eliminado && permissions.canMarcarEstado && (
                    <button
                      onClick={() => recordatorio.enviado ? onMarcarPendiente(recordatorio.id) : onMarcarEnviado(recordatorio.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        recordatorio.enviado
                          ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900'
                          : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                      title={recordatorio.enviado ? 'Marcar como pendiente' : 'Marcar como enviado'}
                    >
                      <FontAwesomeIcon icon={recordatorio.enviado ? faCheck : faClock} className="h-4 w-4" />
                    </button>
                  )}

                  {/* Lógica eliminación */}
                  {recordatorio.eliminado ? (
                    <>
                      {permissions.canRestore && (
                        <button
                          onClick={() => onRestore(recordatorio.id)}
                          className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                          title="Restaurar recordatorio"
                        >
                          <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button
                          onClick={() => onHardDelete(recordatorio.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                          title="Eliminar permanentemente"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    permissions.canDelete && (
                      <button
                        onClick={() => onSoftDelete(recordatorio.id)}
                        className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                        title="Eliminar temporalmente"
                      >
                        <FontAwesomeIcon icon={faRecycle} className="h-4 w-4" />
                      </button>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordatoriosTable;