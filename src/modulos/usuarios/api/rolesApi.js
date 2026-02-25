// Este archivo define las funciones para interactuar con la API de roles.
// Es una API específica para roles, separada de la API general de usuarios.
import { rolesAPI } from '../../../services/api';

export const rolesApi = {
  // getRoles: Función asíncrona para obtener todos los roles disponibles.
  // Recibe un objeto 'params' opcional para filtros.
  getRoles: async (params = {}) => {
    try {
      // Realiza una llamada GET a la API de roles.
      const response = await rolesAPI.getAll(params);
      // Verifica si la respuesta indica éxito.
      if (response.success) {
        // Si es exitosa, retorna la propiedad 'data'.
        return response.data;
      }
      // Si no es exitosa, lanza un error con el mensaje de error de la respuesta.
      throw new Error(response.error);
    } catch (error) {
      // Captura cualquier error que ocurra durante la llamada a la API.
      // Lanza un nuevo error con un mensaje más amigable o el mensaje original del error.
      throw new Error(error.message || 'Error al obtener roles');
    }
  },
};
