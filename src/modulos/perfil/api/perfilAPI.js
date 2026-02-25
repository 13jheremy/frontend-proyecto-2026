// src/modulos/perfil/api/perfilAPI.js
// Integración con servicios/api.js
import { authAPI, usersAPI } from '../../../services/api';

export const obtenerPerfil = async () => {
  const res = await authAPI.getMe();
  if (!res.success) throw new Error(res.error || 'No se pudo obtener el perfil');
  return res.data; // Estructura: { id?, username?, ... } según backend /me/
};

export const actualizarPerfil = async (userId, payload) => {
  // Usa update_complete para permitir actualizar datos de persona también
  const res = await usersAPI.updateComplete(userId, payload);
  return res.data;
};

export const cambiarPassword = async ({ old_password, new_password, confirm_new_password }) => {
  // Usar endpoint directo por requerir confirmación
  // Reutilizamos services/api instancia low-level
  const axios = (await import('axios')).default;
  const { API_CONFIG } = await import('../../../utils/constants');
  const token = localStorage.getItem('access_token');
  const response = await axios.post(
    `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.CHANGE_PASSWORD}`.replace(/\/\//g, '/'),
    { old_password, new_password, confirm_new_password },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return response.data;
};

export default { obtenerPerfil, actualizarPerfil, cambiarPassword };


