// src/modulos/pos/pages/NuevoMantenimientoPOSPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWrench,
  faArrowLeft,
  faPlus,
  faMinus,
  faTrash,
  faUser,
  faMotorcycle,
  faUserCog,
  faCogs,
  faSpinner,
  faSave,
  faCalendarAlt,
  faTachometerAlt,
  faFileAlt,
  faCalculator,
  faCube,
  faTools
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useMaintenanceCart } from '../hooks/useMaintenanceCart';
import { useMantenimientos } from '../../mantenimiento/hooks/useMantenimientos';

// Components
import MotoSearchInput from '../components/MotoSearchInput';
import ServiceSearchInput from '../components/ServiceSearchInput';
import ProductSearchInput from '../components/ProductSearchInput';
import TechnicianSelector from '../components/TechnicianSelector';
import ProductImage from '../components/ProductImage';

const NuevoMantenimientoPOSPage = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [processingMaintenance, setProcessingMaintenance] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);

  // Hooks
  const {
    cliente,
    moto,
    tecnico,
    servicios,
    repuestos,
    maintenanceInfo,
    totales,
    estaVacio,
    tieneCliente,
    tieneMoto,
    tieneTecnico,
    estaCompleto,
    seleccionarCliente,
    seleccionarMoto,
    seleccionarTecnico,
    agregarServicio,
    actualizarCantidadServicio,
    actualizarObservacionesServicio,
    eliminarServicio,
    agregarRepuesto,
    actualizarCantidadRepuesto,
    eliminarRepuesto,
    actualizarMaintenanceInfo,
    validarMantenimiento,
    prepararDatosMantenimiento,
    limpiarTodo
  } = useMaintenanceCart();

  const { createMantenimiento, loading, error } = useMantenimientos();

  // Verificar permisos al cargar el componente
  useEffect(() => {
    const checkPermissions = () => {
      if (!user || !roles) {
        setPermissionLoading(true);
        return;
      }

      // Normalizar roles a minúsculas para comparación
      const userRoles = roles.map(role => role.toLowerCase());
      const allowedRoles = ['empleado', 'administrador'];
      
      const hasAccess = userRoles.some(role => allowedRoles.includes(role));
      
      setHasPermission(hasAccess);
      setPermissionLoading(false);
      
      if (!hasAccess) {
        toast.error('No tienes permisos para crear mantenimientos');
        navigate('/dashboard');
      }
    };

    checkPermissions();
  }, [user, roles, navigate]);

  // Handlers

  const handleProcessMaintenance = async () => {
    try {
      setProcessingMaintenance(true);
      
      if (!validarMantenimiento()) {
        return;
      }

      const datosMantenimiento = prepararDatosMantenimiento();
      if (!datosMantenimiento) {
        return;
      }

      const resultado = await createMantenimiento(datosMantenimiento);
      
      if (resultado && resultado.success) {
        toast.success('Mantenimiento creado exitosamente');
        limpiarTodo();
        navigate('/mantenimiento');
      } else {
        toast.error(resultado?.message || 'Error al crear el mantenimiento');
      }
    } catch (error) {
      console.error('Error procesando mantenimiento:', error);
      toast.error('Error inesperado al crear el mantenimiento');
    } finally {
      setProcessingMaintenance(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  // Mostrar pantalla de carga mientras se verifican permisos
  if (permissionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado si no tiene permisos
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faWrench} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Solo empleados y administradores pueden crear mantenimientos
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="text-white hover:text-yellow-200 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <FontAwesomeIcon icon={faWrench} className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Nuevo Mantenimiento</h1>
                  <p className="text-yellow-100">Crear mantenimiento completo con servicios y repuestos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Selección de Moto */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-purple-600" />
                Motocicleta
              </h3>
              
              {moto ? (
                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">
                      {moto.marca} {moto.modelo} ({moto.año})
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      Placa: {moto.placa} | Kilometraje: {moto.kilometraje?.toLocaleString() || '0'} km
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      Color: {moto.color} | Cilindrada: {moto.cilindrada}cc
                    </p>
                  </div>
                  <button
                    onClick={() => seleccionarMoto(null)}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <MotoSearchInput
                  onMotoSelect={seleccionarMoto}
                  placeholder="Buscar motocicleta..."
                />
              )}
            </div>

            {/* Información del Mantenimiento */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600" />
                Información del Mantenimiento
              </h3>
              
              {!tieneMoto ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FontAwesomeIcon icon={faFileAlt} className="text-4xl mb-3 opacity-50" />
                  <p>Selecciona una motocicleta primero</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                        Fecha de Ingreso
                      </label>
                      <input
                        type="date"
                        value={maintenanceInfo.fechaIngreso}
                        onChange={(e) => actualizarMaintenanceInfo('fechaIngreso', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                        Fecha de Entrega (Estimada)
                      </label>
                      <input
                        type="date"
                        value={maintenanceInfo.fechaEntrega}
                        onChange={(e) => actualizarMaintenanceInfo('fechaEntrega', e.target.value)}
                        min={maintenanceInfo.fechaIngreso}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FontAwesomeIcon icon={faTachometerAlt} className="mr-1" />
                        Kilometraje Actual
                      </label>
                      <input
                        type="number"
                        value={maintenanceInfo.kilometraje}
                        onChange={(e) => actualizarMaintenanceInfo('kilometraje', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Kilometraje actual de la moto"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                      Descripción del Problema
                    </label>
                    <textarea
                      rows={3}
                      value={maintenanceInfo.descripcionProblema}
                      onChange={(e) => actualizarMaintenanceInfo('descripcionProblema', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe el problema o servicio requerido..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Búsqueda de Servicios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faCogs} className="mr-2 text-blue-600" />
                Agregar Servicios
              </h3>
              {!tieneMoto ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FontAwesomeIcon icon={faCogs} className="text-4xl mb-3 opacity-50" />
                  <p>Selecciona una motocicleta primero</p>
                </div>
              ) : (
                <ServiceSearchInput onServiceSelect={agregarServicio} />
              )}
            </div>

            {/* Búsqueda de Repuestos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faCube} className="mr-2 text-orange-600" />
                Agregar Repuestos
              </h3>
              {!tieneMoto ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FontAwesomeIcon icon={faCube} className="text-4xl mb-3 opacity-50" />
                  <p>Selecciona una motocicleta primero</p>
                </div>
              ) : (
                <ProductSearchInput onProductSelect={agregarRepuesto} />
              )}
            </div>

            {/* Lista de Servicios y Repuestos */}
            {(servicios.length > 0 || repuestos.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={faTools} className="mr-2 text-indigo-600" />
                  Servicios y Repuestos ({totales.cantidadTotal} items)
                </h3>
                
                <div className="space-y-4">
                  {/* Servicios */}
                  {servicios.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <FontAwesomeIcon icon={faCogs} className="mr-2 text-blue-600" />
                        Servicios ({servicios.length})
                      </h4>
                      <div className="space-y-2">
                        {servicios.map((servicio) => (
                          <div key={servicio.id} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{servicio.nombre}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Bs. {servicio.precio_unitario} c/u
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => actualizarCantidadServicio(servicio.id, servicio.cantidad - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-xs" />
                              </button>
                              <span className="w-8 text-center font-medium">{servicio.cantidad}</span>
                              <button
                                onClick={() => actualizarCantidadServicio(servicio.id, servicio.cantidad + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                              </button>
                              <div className="text-right ml-4">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Bs. {(servicio.precio_unitario * servicio.cantidad).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => eliminarServicio(servicio.id)}
                                className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full ml-2"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Repuestos */}
                  {repuestos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <FontAwesomeIcon icon={faCube} className="mr-2 text-orange-600" />
                        Repuestos ({repuestos.length})
                      </h4>
                      <div className="space-y-2">
                        {repuestos.map((repuesto) => (
                          <div key={repuesto.id} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                            <div className="flex items-center flex-1">
                              <ProductImage
                                imageUrl={repuesto.imagen_url || repuesto.imagen}
                                productName={repuesto.nombre}
                                size="small"
                                className="mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{repuesto.nombre}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Bs. {repuesto.precio_unitario} c/u | Código: {repuesto.codigo}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => actualizarCantidadRepuesto(repuesto.id, repuesto.cantidad - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-xs" />
                              </button>
                              <span className="w-8 text-center font-medium">{repuesto.cantidad}</span>
                              <button
                                onClick={() => actualizarCantidadRepuesto(repuesto.id, repuesto.cantidad + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                              </button>
                              <div className="text-right ml-4">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Bs. {(repuesto.precio_unitario * repuesto.cantidad).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => eliminarRepuesto(repuesto.id)}
                                className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full ml-2"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Asignación de Técnico */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserCog} className="mr-2 text-indigo-600" />
                Técnico Asignado
              </h3>
              <TechnicianSelector 
                onTechnicianSelect={seleccionarTecnico}
                selectedTechnician={tecnico}
              />
            </div>

            {/* Resumen de Totales */}
            {(servicios.length > 0 || repuestos.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FontAwesomeIcon icon={faCalculator} className="mr-2 text-green-600" />
                  Resumen de Costos
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Servicios:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Bs. {totales.subtotalServicios}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Repuestos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Bs. {totales.subtotalRepuestos}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Bs. {totales.subtotal}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">IVA (16%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Bs. {totales.impuesto}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        Bs. {totales.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Crear Mantenimiento */}
            <button
              onClick={handleProcessMaintenance}
              disabled={!estaCompleto || processingMaintenance || loading}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {processingMaintenance || loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Crear Mantenimiento</span>
                </>
              )}
            </button>

            {/* Botón Limpiar */}
            {!estaVacio && (
              <button
                onClick={limpiarTodo}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Limpiar Todo</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default NuevoMantenimientoPOSPage;
