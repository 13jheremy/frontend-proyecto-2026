// src/modulos/roles/pages/RolesPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button, Table, Modal, Input, Alert, Card } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { rolesAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

const RolesPage = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getAll();
      if (response.success) {
        setRoles(response.data);
      } else {
        toast.error('Error al cargar roles');
      }
    } catch (error) {
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = editingRole 
        ? await rolesAPI.update(editingRole.id, formData)
        : await rolesAPI.create(formData);

      if (response.success) {
        toast.success(editingRole ? 'Rol actualizado' : 'Rol creado');
        fetchRoles();
        handleCloseModal();
      } else {
        setErrors(response.errors || {});
        toast.error('Error al guardar rol');
      }
    } catch (error) {
      toast.error('Error al guardar rol');
    }
  };

  const handleDelete = async (role) => {
    if (window.confirm('¿Está seguro de eliminar este rol?')) {
      try {
        const response = await rolesAPI.delete(role.id);
        if (response.success) {
          toast.success('Rol eliminado');
          fetchRoles();
        } else {
          toast.error('Error al eliminar rol');
        }
      } catch (error) {
        toast.error('Error al eliminar rol');
      }
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ nombre: '', descripcion: '' });
    setErrors({});
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id'
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      header: 'Descripción',
      accessor: 'descripcion',
      render: (value) => (
        <span className="text-gray-600">{value || 'Sin descripción'}</span>
      )
    },
    {
      header: 'Usuarios',
      accessor: 'usuarios_count',
      render: (value) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      )
    }
  ];

  const actions = (role) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(role)}
        icon={Edit}
      >
        Editar
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDelete(role)}
        icon={Trash2}
      >
        Eliminar
      </Button>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <Card
        title="Gestión de Roles"
        subtitle="Administra los roles del sistema"
        headerActions={
          <Button
            onClick={() => setShowModal(true)}
            icon={Plus}
          >
            Nuevo Rol
          </Button>
        }
      >
        <Table
          columns={columns}
          data={roles}
          loading={loading}
          actions={actions}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingRole ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Rol"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
            required
          />
          <Input
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            error={errors.descripcion}
          />
        </form>
      </Modal>
    </div>
  );
};

export default RolesPage;
