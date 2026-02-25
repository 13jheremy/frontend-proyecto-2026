// src/modulos/cliente/pages/MiPerfilPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { personsAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faSave, faTimes, faSpinner, faPhone, faEnvelope, faMapMarkerAlt, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { showNotification } from '../../../utils/notifications';

const MiPerfilPage = () => {
  const { user, updateUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Cargar datos del perfil
  const loadPerfil = async () => {
    try {
      setLoading(true);
      
      if (user?.persona?.id) {
        const result = await personsAPI.getById(user.persona.id);
        
        if (result.success) {
          // Si el perfil no tiene email, usar el del usuario
          const perfilConEmail = {
            ...result.data,
            email: result.data.email || user?.correo_electronico || ''
          };
          
          setPerfil(perfilConEmail);
          setFormData({
            nombre: result.data.nombre || '',
            apellido: result.data.apellido || '',
            telefono: result.data.telefono || '',
            email: result.data.email || user?.correo_electronico || '',
            direccion: result.data.direccion || '',
            cedula: result.data.cedula || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading perfil:', error);
      showNotification.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, [user]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validaciones básicas
      if (!formData.nombre || !formData.apellido || !formData.email) {
        showNotification.error('Por favor completa los campos obligatorios');
        return;
      }

      const result = await personsAPI.update(user.persona.id, formData);
      if (result.success) {
        setPerfil(result.data);
        setEditing(false);
        showNotification.success('Perfil actualizado correctamente');
        
        // Actualizar el contexto de usuario si es necesario
        await updateUser();
      } else {
        showNotification.error(result.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error saving perfil:', error);
      showNotification.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: perfil?.nombre || '',
      apellido: perfil?.apellido || '',
      telefono: perfil?.telefono || '',
      email: perfil?.email || '',
      direccion: perfil?.direccion || '',
      cedula: perfil?.cedula || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
        <span className="ml-3 text-lg">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Mi Perfil
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Gestiona tu información personal
                </p>
              </div>
            </div>
            
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} />
                <span>Editar Perfil</span>
              </button>
            )}
          </div>
        </div>

        {/* Formulario de perfil */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Información Personal
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Nombre *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Ingresa tu nombre"
                  />
                ) : (
                  <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {perfil?.nombre || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Apellido *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Ingresa tu apellido"
                  />
                ) : (
                  <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {perfil?.apellido || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  Cédula
                </label>
                <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                  {perfil?.cedula || 'No especificado'}
                </p>
                <small className="text-slate-500 dark:text-slate-400">
                  La cédula no se puede modificar
                </small>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email *
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Ingresa tu email"
                  />
                ) : (
                  <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {perfil?.email || user?.correo_electronico || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Teléfono
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Ingresa tu teléfono"
                  />
                ) : (
                  <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {perfil?.telefono || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Dirección
                </label>
                {editing ? (
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Ingresa tu dirección"
                  />
                ) : (
                  <p className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100 min-h-[80px]">
                    {perfil?.direccion || 'No especificado'}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            {editing && (
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FontAwesomeIcon icon={faUser} className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Información de la cuenta
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Algunos campos como la cédula no pueden ser modificados por seguridad. 
                Si necesitas cambiar esta información, contacta al administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfilPage;
