// src/modules/recordatorios/index.js
// Archivo principal del módulo de recordatorios

// Páginas
export { default as RecordatoriosPage } from './pages/RecordatoriosPage';

// Componentes
export { default as RecordatoriosTable } from './pages/components/RecordatoriosTable';
export { default as RecordatorioCreateModal } from './pages/components/RecordatorioCreateModal';
export { default as RecordatorioEditModal } from './pages/components/RecordatorioEditModal';
export { default as RecordatorioSearch } from './pages/components/RecordatorioSearch';
export { default as RecordatorioActionModal } from './pages/components/RecordatorioActionModal';
export { default as InfoRecordatorioModal } from './pages/components/InfoRecordatorioModal';

// Hooks
export { useRecordatorios } from './hooks/useRecordatorios';

// API
export { recordatorioApi } from './api/recordatorio';

// Utilidades
export * from './utils/recordatorioUtils';

// Constantes específicas del módulo
export const RECORDATORIO_TYPES = {
  MANTENIMIENTO_PREVENTIVO: 'mantenimiento_preventivo',
  REVISION_GENERAL: 'revision_general',
  CAMBIO_ACEITE: 'cambio_aceite',
  CAMBIO_LLANTAS: 'cambio_llantas',
  REVISION_FRENOS: 'revision_frenos',
  ALINEACION_BALANCEO: 'alineacion_balanceo',
  OTROS: 'otros'
};

export const RECORDATORIO_STATUS = {
  PENDIENTE: 'pendiente',
  COMPLETADO: 'completado',
  VENCIDO: 'vencido',
  URGENTE: 'urgente'
};

// Configuración del módulo
export const recordatoriosModule = {
  name: 'Recordatorios',
  path: '/recordatorios',
  icon: 'bell',
  permissions: {
    view: ['admin', 'empleado', 'tecnico'],
    create: ['admin', 'empleado'],
    edit: ['admin', 'empleado'],
    delete: ['admin']
  }
};