// src/modulos/mantenimiento/pages/components/DetalleMantenimientoModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faList, faTools, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { formatPrecioMantenimiento, getServicioNombre } from '../../utils/mantenimientoUtils';

/**
 * Modal para gestionar detalles de mantenimiento.
 */
const DetalleMantenimientoModal = ({
  isOpen,
  onClose,
  mantenimientoData = null,
  onCreateDetalle,
  onUpdateDetalle,
  onDeleteDetalle
}) => {
  const [detalles, setDetalles] = useState([]);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [formData, setFormData] = useState({
    servicio_id: '',
    precio: '',
    observaciones: ''
  });
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mantenimientoData) {
      setDetalles(mantenimientoData.detalles || []);
      // Simular carga de servicios disponibles
      setServicios([
        { id: 1, nombre: 'Cambio de aceite', precio: 50.00 },
        { id: 2, nombre: 'Cambio de filtros', precio: 30.00 },
        { id: 3, nombre: 'Revisión de frenos', precio: 40.00 },
        { id: 4, nombre: 'Alineación y balanceo', precio: 60.00 },
        { id: 5, nombre: 'Cambio de bujías', precio: 25.00 }
      ]);
    }
  }, [isOpen, mantenimientoData]);

  const resetForm = () => {
    setFormData({
      servicio_id: '',
      precio: '',
      observaciones: ''
    });
    setIsCreateMode(false);
    setEditingDetalle(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateMode(true);
  };

  const handleEdit = (detalle) => {
    setFormData({
      servicio_id: detalle.servicio?.id || '',
      precio: detalle.precio || '',
      observaciones: detalle.observaciones || ''
    });
    setEditingDetalle(detalle);
    setIsCreateMode(false);
  };

  const handleDelete = async (detalleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este detalle?')) {
      try {
        await onDeleteDetalle(detalleId);
        setDetalles(prev => prev.filter(d => d.id !== detalleId));
      } catch (error) {
        console.error('Error eliminando detalle:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const detalleData = {
        ...formData,
        mantenimiento: mantenimientoData.mantenimiento.id,
        precio: parseFloat(formData.precio)
      };

      if (editingDetalle) {
        await onUpdateDetalle(editingDetalle.id, detalleData);
        // Actualizar el detalle en la lista local
        setDetalles(prev => prev.map(d =>
          d.id === editingDetalle.id
            ? { ...d, ...detalleData, servicio: servicios.find(s => s.id === parseInt(formData.servicio_id)) }
            : d
        ));
      } else {
        const newDetalle = await onCreateDetalle(detalleData);
        setDetalles(prev => [...prev, newDetalle]);
      }

      resetForm();
    } catch (error) {
      console.error('Error guardando detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    const servicio = servicios.find(s => s.id === parseInt(servicioId));
    setFormData(prev => ({
      ...prev,
      servicio_id: servicioId,
      precio: servicio ? servicio.precio.toString() : prev.precio
    }));
  };

  const calcularTotal = () => {
    return detalles.reduce((total, detalle) => total + (parseFloat(detalle.precio) || 0), 0);
  };

  if (!mantenimientoData) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles del Mantenimiento - ${mantenimientoData.mantenimiento?.moto?.marca} ${mantenimientoData.mantenimiento?.moto?.modelo}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Información del mantenimiento */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Información del Mantenimiento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Moto:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {mantenimientoData.mantenimiento?.moto?.marca} {mantenimientoData.mantenimiento?.moto?.modelo}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Propietario:</span>
              <p className="text-gray-900 dark:text-gray-100">
                {mantenimientoData.mantenimiento?.moto?.propietario?.nombre} {mantenimientoData.mantenimiento?.moto?.propietario?.apellido}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrecioMantenimiento(calcularTotal())}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de detalles */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <FontAwesomeIcon icon={faList} className="mr-2 text-blue-600" />
              Servicios Realizados
            </h4>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              Agregar Servicio
            </button>
          </div>

          {detalles.length === 0 ? (
            <div className="p-8 text-center">
              <FontAwesomeIcon icon={faTools} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hay servicios registrados
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Agrega el primer servicio realizado en este mantenimiento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Observaciones
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {detalles.map((detalle) => (
                    <tr key={detalle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getServicioNombre(detalle.servicio)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatPrecioMantenimiento(detalle.precio)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {detalle.observaciones || 'Sin observaciones'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(detalle)}
                            className="p-1 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                            title="Editar detalle"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(detalle.id)}
                            className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                            title="Eliminar detalle"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulario para crear/editar detalle */}
        {(isCreateMode || editingDetalle) && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              {editingDetalle ? 'Editar Servicio' : 'Agregar Servicio'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Servicio *
                  </label>
                  <select
                    name="servicio_id"
                    id="servicio_id"
                    value={formData.servicio_id}
                    onChange={handleServicioChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - {formatPrecioMantenimiento(servicio.precio)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    id="precio"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  id="observaciones"
                  rows="2"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales sobre el servicio..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingDetalle ? 'Actualizar' : 'Agregar')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

DetalleMantenimientoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimientoData: PropTypes.object,
  onCreateDetalle: PropTypes.func.isRequired,
  onUpdateDetalle: PropTypes.func.isRequired,
  onDeleteDetalle: PropTypes.func.isRequired,
};

export default DetalleMantenimientoModal;