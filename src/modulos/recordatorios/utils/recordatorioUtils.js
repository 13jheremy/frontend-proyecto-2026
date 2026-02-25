// src/modules/recordatorios/utils/recordatorioUtils.js

// Funciones de utilidad para recordatorios

export const formatRecordatorioStatus = (enviado, fechaProgramada) => {
  const today = new Date();
  const programDate = new Date(fechaProgramada);

  if (enviado) {
    return { status: 'completado', color: 'green', text: 'Enviado' };
  }

  if (programDate < today) {
    return { status: 'vencido', color: 'red', text: 'Vencido' };
  }

  const diffTime = programDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return { status: 'urgente', color: 'orange', text: `En ${diffDays} día${diffDays !== 1 ? 's' : ''}` };
  }

  if (diffDays <= 7) {
    return { status: 'proximo', color: 'yellow', text: `En ${diffDays} días` };
  }

  return { status: 'pendiente', color: 'blue', text: 'Pendiente' };
};

export const getRecordatorioPriority = (tipo, fechaProgramada) => {
  const today = new Date();
  const programDate = new Date(fechaProgramada);
  const diffTime = programDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Prioridades basadas en tipo y urgencia
  if (diffDays < 0) return 'alta'; // Vencido
  if (diffDays <= 3) return 'alta'; // Muy próximo
  if (tipo === 'mantenimiento_preventivo') return 'media';
  if (tipo === 'revision_general') return 'media';
  return 'baja';
};

export const validateRecordatorioData = (data) => {
  const errors = {};

  if (!data.fecha_programada) {
    errors.fecha_programada = 'La fecha programada es obligatoria';
  } else {
    const programDate = new Date(data.fecha_programada);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (programDate < today) {
      errors.fecha_programada = 'La fecha programada no puede ser anterior a hoy';
    }
  }

  if (!data.moto) {
    errors.moto = 'La moto es obligatoria';
  }

  if (!data.categoria_servicio) {
    errors.categoria_servicio = 'La categoría de servicio es obligatoria';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getRecordatorioTypeLabel = (tipo) => {
  const tipos = {
    mantenimiento_preventivo: 'Mantenimiento Preventivo',
    revision_general: 'Revisión General',
    cambio_aceite: 'Cambio de Aceite',
    cambio_llantas: 'Cambio de Llantas',
    revision_frenos: 'Revisión de Frenos',
    alineacion_balanceo: 'Alineación y Balanceo',
    otros: 'Otros'
  };

  return tipos[tipo] || tipo;
};

export const filterRecordatoriosByStatus = (recordatorios, status) => {
  const today = new Date();

  return recordatorios.filter(recordatorio => {
    if (recordatorio.enviado) {
      return status === 'completado';
    }

    const programDate = new Date(recordatorio.fecha_programada);
    const diffTime = programDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (status) {
      case 'pendientes':
        return !recordatorio.enviado;
      case 'vencidos':
        return diffDays < 0 && !recordatorio.enviado;
      case 'hoy':
        return diffDays === 0 && !recordatorio.enviado;
      case 'esta_semana':
        return diffDays >= 0 && diffDays <= 7 && !recordatorio.enviado;
      case 'este_mes':
        return diffDays >= 0 && diffDays <= 30 && !recordatorio.enviado;
      default:
        return true;
    }
  });
};