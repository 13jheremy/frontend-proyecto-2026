// src/modulos/perfil/pages/PerfilPage.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import usePerfil from '../hooks/usePerfil';
import PasswordForm from './components/PasswordForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUserEdit, 
  faLock, 
  faSave,
  faEnvelope,
  faIdCard,
  faUserCircle,
  faKey
} from '@fortawesome/free-solid-svg-icons';

const Field = ({ label, icon, children }) => (
  <label className="text-sm">
    <span className="block text-gray-700 dark:text-gray-300 mb-2 font-medium flex items-center">
      {icon && <FontAwesomeIcon icon={icon} className="mr-2 text-blue-600" />}
      {label}
    </span>
    {children}
  </label>
);

const PerfilPage = () => {
  const { perfil, loading, error, updatePerfil, changePassword } = usePerfil();
  const [form, setForm] = useState({ username: '', correo_electronico: '', persona_nombre: '', persona_apellido: '' });

  React.useEffect(() => {
    if (perfil?.user) {
      setForm({
        username: perfil.user.username || '',
        correo_electronico: perfil.user.correo_electronico || '',
        persona_nombre: perfil.user.persona?.nombre || '',
        persona_apellido: perfil.user.persona?.apellido || '',
      });
    }
  }, [perfil]);

  const emailRegex = /\S+@\S+\.\S+/;

  const savePerfil = async (e) => {
    e.preventDefault();
    // Validaciones básicas
    if (!form.username || form.username.trim().length < 3) {
      toast.error('El usuario debe tener al menos 3 caracteres');
      return;
    }
    if (!form.correo_electronico || !emailRegex.test(form.correo_electronico)) {
      toast.error('Ingresa un correo válido');
      return;
    }
    if (form.persona_nombre && form.persona_nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (form.persona_apellido && form.persona_apellido.trim().length < 2) {
      toast.error('El apellido debe tener al menos 2 caracteres');
      return;
    }
    const payload = {
      username: form.username,
      correo_electronico: form.correo_electronico,
      persona_nombre: form.persona_nombre,
      persona_apellido: form.persona_apellido,
    };
    try {
      await updatePerfil(payload);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'No se pudo actualizar el perfil');
    }
  };

  if (loading && !perfil) {
    return (
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-blue-600" />
          Mi Perfil
        </h1>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200">{error?.message || 'Error al cargar el perfil'}</div>
        </div>
      )}

      {/* SECCIONES */}
      <div className="space-y-6">
        {/* DATOS PERSONALES */}
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon icon={faUserEdit} className="mr-3 text-blue-600" />
              Datos Personales
            </h2>
          </div>
          <form onSubmit={savePerfil} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nombre de Usuario" icon={faUser}>
              <input 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Ingresa tu nombre de usuario"
              />
            </Field>
            
            <Field label="Correo Electrónico" icon={faEnvelope}>
              <input 
                type="email" 
                value={form.correo_electronico} 
                onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="tu@email.com"
              />
            </Field>
            
            <Field label="Nombre" icon={faIdCard}>
              <input 
                value={form.persona_nombre} 
                onChange={(e) => setForm({ ...form, persona_nombre: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Tu nombre"
              />
            </Field>
            
            <Field label="Apellido" icon={faIdCard}>
              <input 
                value={form.persona_apellido} 
                onChange={(e) => setForm({ ...form, persona_apellido: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Tu apellido"
              />
            </Field>
            
            <div className="md:col-span-2 flex justify-end">
              <button 
                disabled={loading} 
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* CAMBIAR CONTRASEÑA */}
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-3 text-blue-600" />
              Cambiar Contraseña
            </h2>
          </div>
          
          <PasswordForm
            onSubmit={async (values) => {
              try {
                await changePassword(values);
                toast.success('Contraseña cambiada correctamente');
              } catch (err) {
                const msg = err?.response?.data?.error || err?.response?.data?.detail || 'No se pudo cambiar la contraseña';
                toast.error(msg);
              }
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;


