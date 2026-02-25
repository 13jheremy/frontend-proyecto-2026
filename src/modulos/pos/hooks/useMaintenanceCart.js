// src/modulos/pos/hooks/useMaintenanceCart.js
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

export const useMaintenanceCart = () => {
  // Estados principales
  const [cliente, setCliente] = useState(null);
  const [moto, setMoto] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  
  // Información del mantenimiento
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    kilometraje: '',
    descripcionProblema: '',
    diagnostico: '',
    observaciones: ''
  });

  // Gestión de cliente (removido - ya no se usa)
  const seleccionarCliente = useCallback((clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    // Limpiar moto al cambiar cliente
    setMoto(null);
  }, []);

  // Gestión de moto
  const seleccionarMoto = useCallback((motoSeleccionada) => {
    setMoto(motoSeleccionada);
    // Auto-completar kilometraje si está disponible
    if (motoSeleccionada?.kilometraje) {
      setMaintenanceInfo(prev => ({
        ...prev,
        kilometraje: motoSeleccionada.kilometraje.toString()
      }));
    }
  }, []);

  // Gestión de técnico
  const seleccionarTecnico = useCallback((tecnicoSeleccionado) => {
    setTecnico(tecnicoSeleccionado);
  }, []);

  // Gestión de servicios
  const agregarServicio = useCallback((servicio) => {
    const existingIndex = servicios.findIndex(item => item.id === servicio.id);
    
    if (existingIndex >= 0) {
      const nuevosServicios = [...servicios];
      nuevosServicios[existingIndex].cantidad += 1;
      setServicios(nuevosServicios);
      toast.info(`Cantidad de "${servicio.nombre}" actualizada`);
    } else {
      const nuevoServicio = {
        ...servicio,
        cantidad: 1,
        precio_unitario: parseFloat(servicio.precio || 0),
        observaciones: ''
      };
      setServicios(prev => [...prev, nuevoServicio]);
      toast.success(`Servicio "${servicio.nombre}" agregado`);
    }
  }, [servicios]);

  const actualizarCantidadServicio = useCallback((id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarServicio(id);
      return;
    }
    
    setServicios(prev => prev.map(servicio => 
      servicio.id === id ? { ...servicio, cantidad: nuevaCantidad } : servicio
    ));
  }, []);

  const actualizarObservacionesServicio = useCallback((id, observaciones) => {
    setServicios(prev => prev.map(servicio => 
      servicio.id === id ? { ...servicio, observaciones } : servicio
    ));
  }, []);

  const eliminarServicio = useCallback((id) => {
    setServicios(prev => {
      const servicio = prev.find(s => s.id === id);
      if (servicio) {
        toast.info(`Servicio "${servicio.nombre}" eliminado`);
      }
      return prev.filter(s => s.id !== id);
    });
  }, []);

  // Gestión de repuestos
  const agregarRepuesto = useCallback((producto) => {
    const existingIndex = repuestos.findIndex(item => item.id === producto.id);
    
    if (existingIndex >= 0) {
      const nuevosRepuestos = [...repuestos];
      nuevosRepuestos[existingIndex].cantidad += 1;
      setRepuestos(nuevosRepuestos);
      toast.info(`Cantidad de "${producto.nombre}" actualizada`);
    } else {
      const nuevoRepuesto = {
        ...producto,
        cantidad: 1,
        precio_unitario: parseFloat(producto.precio_venta || 0)
      };
      setRepuestos(prev => [...prev, nuevoRepuesto]);
      toast.success(`Repuesto "${producto.nombre}" agregado`);
    }
  }, [repuestos]);

  const actualizarCantidadRepuesto = useCallback((id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarRepuesto(id);
      return;
    }
    
    setRepuestos(prev => prev.map(repuesto => 
      repuesto.id === id ? { ...repuesto, cantidad: nuevaCantidad } : repuesto
    ));
  }, []);

  const eliminarRepuesto = useCallback((id) => {
    setRepuestos(prev => {
      const repuesto = prev.find(r => r.id === id);
      if (repuesto) {
        toast.info(`Repuesto "${repuesto.nombre}" eliminado`);
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  // Actualizar información del mantenimiento
  const actualizarMaintenanceInfo = useCallback((campo, valor) => {
    setMaintenanceInfo(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Cálculos de totales
  const totales = useMemo(() => {
    const subtotalServicios = servicios.reduce((sum, servicio) => 
      sum + (servicio.precio_unitario * servicio.cantidad), 0
    );
    
    const subtotalRepuestos = repuestos.reduce((sum, repuesto) => 
      sum + (repuesto.precio_unitario * repuesto.cantidad), 0
    );
    
    const subtotal = subtotalServicios + subtotalRepuestos;
    const impuesto = subtotal * 0.16; // 16% IVA
    const total = subtotal + impuesto;

    return {
      subtotalServicios: subtotalServicios.toFixed(2),
      subtotalRepuestos: subtotalRepuestos.toFixed(2),
      subtotal: subtotal.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: total.toFixed(2),
      cantidadServicios: servicios.length,
      cantidadRepuestos: repuestos.length,
      cantidadTotal: servicios.length + repuestos.length
    };
  }, [servicios, repuestos]);

  // Validaciones
  const validarMantenimiento = useCallback(() => {
    if (!moto) {
      toast.error('Debe seleccionar una motocicleta');
      return false;
    }

    if (!tecnico) {
      toast.error('Debe asignar un técnico');
      return false;
    }

    if (!maintenanceInfo.fechaIngreso) {
      toast.error('Debe especificar la fecha de ingreso');
      return false;
    }

    if (!maintenanceInfo.kilometraje) {
      toast.error('Debe especificar el kilometraje actual');
      return false;
    }

    if (!maintenanceInfo.descripcionProblema.trim()) {
      toast.error('Debe describir el problema o servicio requerido');
      return false;
    }

    if (servicios.length === 0 && repuestos.length === 0) {
      toast.error('Debe agregar al menos un servicio o repuesto');
      return false;
    }

    return true;
  }, [moto, tecnico, maintenanceInfo, servicios, repuestos]);

  // Preparar datos para envío
  const prepararDatosMantenimiento = useCallback(() => {
    if (!validarMantenimiento()) {
      return null;
    }

    return {
      // Información básica
      moto_id: moto.id,
      tecnico_asignado_id: tecnico.id,
      fecha_ingreso: maintenanceInfo.fechaIngreso,
      fecha_entrega: maintenanceInfo.fechaEntrega || null,
      kilometraje_ingreso: parseInt(maintenanceInfo.kilometraje),
      descripcion_problema: maintenanceInfo.descripcionProblema,
      diagnostico: maintenanceInfo.diagnostico || '',
      estado: 'pendiente',
      
      // Servicios
      servicios: servicios.map(servicio => ({
        servicio_id: servicio.id,
        precio: servicio.precio_unitario,
        observaciones: servicio.observaciones || ''
      })),
      
      // Repuestos
      repuestos: repuestos.map(repuesto => ({
        producto_id: repuesto.id,
        cantidad: repuesto.cantidad,
        precio_unitario: repuesto.precio_unitario
      })),
      
      // Totales
      total: parseFloat(totales.total)
    };
  }, [cliente, moto, tecnico, maintenanceInfo, servicios, repuestos, totales, validarMantenimiento]);

  // Limpiar todo
  const limpiarTodo = useCallback(() => {
    setCliente(null);
    setMoto(null);
    setTecnico(null);
    setServicios([]);
    setRepuestos([]);
    setMaintenanceInfo({
      fechaIngreso: new Date().toISOString().split('T')[0],
      fechaEntrega: '',
      kilometraje: '',
      descripcionProblema: '',
      diagnostico: '',
      observaciones: ''
    });
    toast.info('Formulario limpiado');
  }, []);

  // Estados derivados
  const estaVacio = servicios.length === 0 && repuestos.length === 0;
  const tieneCliente = cliente !== null;
  const tieneMoto = moto !== null;
  const tieneTecnico = tecnico !== null;
  const estaCompleto = tieneMoto && tieneTecnico && !estaVacio;

  return {
    // Estados
    cliente,
    moto,
    tecnico,
    servicios,
    repuestos,
    maintenanceInfo,
    totales,
    
    // Estados derivados
    estaVacio,
    tieneCliente,
    tieneMoto,
    tieneTecnico,
    estaCompleto,
    
    // Acciones de cliente y moto
    seleccionarCliente,
    seleccionarMoto,
    seleccionarTecnico,
    
    // Acciones de servicios
    agregarServicio,
    actualizarCantidadServicio,
    actualizarObservacionesServicio,
    eliminarServicio,
    
    // Acciones de repuestos
    agregarRepuesto,
    actualizarCantidadRepuesto,
    eliminarRepuesto,
    
    // Información del mantenimiento
    actualizarMaintenanceInfo,
    
    // Utilidades
    validarMantenimiento,
    prepararDatosMantenimiento,
    limpiarTodo
  };
};
