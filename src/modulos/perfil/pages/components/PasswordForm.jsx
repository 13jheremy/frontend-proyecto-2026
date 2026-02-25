// src/modulos/perfil/pages/components/PasswordForm.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordForm = ({ onSubmit, loading }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    onSubmit?.({ old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmNewPassword });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
            Contraseña Actual
          </label>
          <div className="relative">
            <input 
              type={showPasswords.old ? "text" : "password"}
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Ingresa tu contraseña actual"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('old')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={showPasswords.old ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <FontAwesomeIcon icon={faKey} className="mr-2 text-blue-600" />
            Nueva Contraseña
          </label>
          <div className="relative">
            <input 
              type={showPasswords.new ? "text" : "password"}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Ingresa tu nueva contraseña"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <FontAwesomeIcon icon={faKey} className="mr-2 text-blue-600" />
            Confirmar Nueva
          </label>
          <div className="relative">
            <input 
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmNewPassword} 
              onChange={(e) => setConfirmNewPassword(e.target.value)} 
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Confirma tu nueva contraseña"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          disabled={loading} 
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <FontAwesomeIcon icon={faLock} className="mr-2" />
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;


