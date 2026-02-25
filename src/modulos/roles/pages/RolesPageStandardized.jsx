// src/modulos/roles/pages/RolesPageStandardized.jsx
// Standardized roles management page using new UI components and patterns

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faShield } from '@fortawesome/free-solid-svg-icons';

// Standardized components
import DataManager from '../../../components/ui/DataManager';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { FormErrors, useFormValidation, validators } from '../../../components/ui/FormValidation';
import ConfirmationModal from '../../../components/ConfirmationModal';

// Services
import { rolesService } from '../../../services/serviceFactory';
import { useAuth } from '../../../hooks/useAuth';

const RolesPageStandardized = () => {
  const { user } = useAuth();
  
  // State management
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [targetRole, setTargetRole] = useState(null);

  // Form validation
  const validationRules = {
    nombre: [
      validators.required('El nombre del rol es requerido'),
      validators.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      validators.maxLength(50, 'El nombre no debe exceder 50 caracteres')
    ],
    descripcion: [
      validators.maxLength(200, 'La descripción no debe exceder 200 caracteres')
    ]
  };

  const {
    data: formData,
    errors: formErrors,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset: resetForm,
    setErrors: setFormErrors
  } = useFormValidation({
    nombre: '',
    descripcion: ''
  }, validationRules);

  // Table columns configuration
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      sortable: true,
      className: 'text-gray-500 font-mono text-sm'
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      sortable: true,
      searchable: true,
      render: (value, item) => (
        <div className="flex items-center">
          <FontAwesomeIcon 
            icon={faShield} 
            className={`mr-2 ${item.activo ? 'text-green-500' : 'text-gray-400'}`}
          />
          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      header: 'Descripción',
      accessor: 'descripcion',
      searchable: true,
      render: (value) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value || 'Sin descripción'}
        </span>
      )
    },
    {
      header: 'Usuarios',
      accessor: 'usuarios_count',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-1 text-gray-400" />
          <span className="text-sm font-medium">{value || 0}</span>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      type: 'status',
      statusType: 'active',
      sortable: true
    },
    {
      header: 'Creado',
      accessor: 'created_at',
      type: 'datetime',
      sortable: true,
      className: 'text-sm text-gray-500'
    }
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      key: 'activate',
      label: 'Activar seleccionados',
      icon: 'check',
      color: 'green'
    },
    {
      key: 'deactivate',
      label: 'Desactivar seleccionados',
      icon: 'times',
      color: 'red'
    },
    {
      key: 'delete',
      label: 'Eliminar seleccionados',
      icon: 'trash',
      color: 'red'
    }
  ];

  // Load data
  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesService.getAll();
      
      if (response.success) {
        setRoles(response.data);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Error al cargar los roles');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await rolesService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // CRUD operations
  const handleAdd = () => {
    setEditingRole(null);
    resetForm();
    setShowFormModal(true);
  };

  const handleView = (role) => {
    // Implementation for viewing role details
    console.log('View role:', role);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    resetForm({
      nombre: role.nombre,
      descripcion: role.descripcion || ''
    });
    setShowFormModal(true);
  };

  const handleDelete = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setTargetRole(role);
    setActionType('delete');
    setShowConfirmModal(true);
  };

  const handleActivate = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setTargetRole(role);
    setActionType('activate');
    setShowConfirmModal(true);
  };

  const handleDeactivate = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setTargetRole(role);
    setActionType('deactivate');
    setShowConfirmModal(true);
  };

  const handleRestore = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setTargetRole(role);
    setActionType('restore');
    setShowConfirmModal(true);
  };

  const handleHardDelete = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setTargetRole(role);
    setActionType('hardDelete');
    setShowConfirmModal(true);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (editingRole) {
        response = await rolesService.update(editingRole.id, formData);
      } else {
        response = await rolesService.create(formData);
      }

      if (response.success) {
        toast.success(editingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
        setShowFormModal(false);
        resetForm();
        fetchRoles();
        fetchStats();
      } else {
        if (response.validationErrors) {
          setFormErrors(response.validationErrors);
        } else {
          toast.error(response.error);
        }
      }
    } catch (error) {
      toast.error('Error al guardar el rol');
      console.error('Error saving role:', error);
    } finally {
      setLoading(false);
    }
  };

  // Confirmation actions
  const handleConfirmAction = async () => {
    if (!targetRole || !actionType) return;

    try {
      setLoading(true);
      let response;

      switch (actionType) {
        case 'delete':
          response = await rolesService.softDelete(targetRole.id);
          break;
        case 'activate':
          response = await rolesService.activate(targetRole.id);
          break;
        case 'deactivate':
          response = await rolesService.deactivate(targetRole.id);
          break;
        case 'restore':
          response = await rolesService.restore(targetRole.id);
          break;
        case 'hardDelete':
          response = await rolesService.hardDelete(targetRole.id);
          break;
        default:
          return;
      }

      if (response.success) {
        fetchRoles();
        fetchStats();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setTargetRole(null);
      setActionType(null);
    }
  };

  const getConfirmationMessage = () => {
    if (!targetRole || !actionType) return '';

    const messages = {
      delete: `¿Estás seguro de que deseas eliminar el rol "${targetRole.nombre}"? Esta acción se puede deshacer.`,
      activate: `¿Estás seguro de que deseas activar el rol "${targetRole.nombre}"?`,
      deactivate: `¿Estás seguro de que deseas desactivar el rol "${targetRole.nombre}"?`,
      restore: `¿Estás seguro de que deseas restaurar el rol "${targetRole.nombre}"?`,
      hardDelete: `¿Estás seguro de que deseas eliminar permanentemente el rol "${targetRole.nombre}"? Esta acción NO se puede deshacer.`
    };

    return messages[actionType] || '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los roles y permisos del sistema
          </p>
        </div>
      </div>

      {/* Data Manager */}
      <DataManager
        title="Roles del Sistema"
        data={roles}
        columns={columns}
        loading={loading}
        error={error}
        stats={stats}
        service={rolesService}
        
        // Actions configuration
        actions={{
          view: true,
          edit: true,
          delete: true,
          activate: true,
          restore: true,
          hardDelete: user?.rol === 'Administrador' // Only admins can hard delete
        }}
        
        // View modes
        viewModes={['active', 'inactive', 'deleted', 'all']}
        defaultViewMode="active"
        
        // Features
        searchable={true}
        searchPlaceholder="Buscar roles..."
        selectable={true}
        bulkActions={bulkActions}
        showStats={true}
        showAddButton={true}
        showRefreshButton={true}
        
        // Callbacks
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        onRefresh={fetchRoles}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Errors */}
          <FormErrors errors={formErrors} />

          {/* Form Fields */}
          <div className="space-y-4">
            <Input
              label="Nombre del Rol"
              value={formData.nombre}
              onChange={(e) => setFieldValue('nombre', e.target.value)}
              onBlur={() => setFieldTouched('nombre')}
              error={formErrors.nombre}
              required
              placeholder="Ej: Administrador, Empleado, etc."
            />

            <Input
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFieldValue('descripcion', e.target.value)}
              onBlur={() => setFieldTouched('descripcion')}
              error={formErrors.descripcion}
              placeholder="Descripción opcional del rol"
              multiline
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFormModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isValid}
              loading={loading}
            >
              {editingRole ? 'Actualizar' : 'Crear'} Rol
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title="Confirmar Acción"
        message={getConfirmationMessage()}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type={actionType === 'hardDelete' ? 'danger' : 'warning'}
        loading={loading}
      />
    </div>
  );
};

export default RolesPageStandardized;
