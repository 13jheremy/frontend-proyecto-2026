// Este archivo define las funciones para interactuar con la API de usuarios y roles.
// Utiliza los servicios 'usersAPI' y 'rolesAPI' para realizar las operaciones HTTP.

import { usersAPI, rolesAPI } from '../../../services/api';

export const usuarioApi = {
  // USUARIOS BÁSICOS - Ahora usersAPI lanza errores directamente
  // getUsuarios: Función asíncrona para obtener todos los usuarios.
  // Recibe un objeto 'params' opcional para filtros o paginación.
  getUsuarios: async (params = {}) => {
    // Realiza una llamada GET a la API de usuarios.
    const response = await usersAPI.getAll(params);
    // usersAPI.getAll ahora retorna {success: true, data} o lanza un error si falla.
    // Retorna la propiedad 'data' de la respuesta, que contiene la lista de usuarios.
    return response.data;
  },

  // getUsuarioById: Función asíncrona para obtener un usuario por su ID.
  // Recibe el 'id' del usuario como parámetro.
  getUsuarioById: async (id) => {
    // Realiza una llamada GET a la API para obtener un usuario específico.
    const response = await usersAPI.getById(id);
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // createSimple: Función asíncrona para crear un usuario con datos básicos.
  // Recibe un objeto 'data' con la información del nuevo usuario.
  createSimple: async (data) => {
    // Realiza una llamada POST a la API para crear un nuevo usuario.
    // usersAPI.create lanzará un error de Axios directamente si la operación falla.
    const response = await usersAPI.create(data);
    // Retorna la propiedad 'data' de la respuesta, que incluye el usuario creado.
    return response.data;
  },

  // createComplete: Función asíncrona para crear un usuario con datos completos (incluyendo persona).
  // Recibe un objeto 'data' con toda la información del nuevo usuario y su persona asociada.
  createComplete: async (data) => {
    // Realiza una llamada POST a la API para crear un usuario completo.
    const response = await usersAPI.createComplete(data);
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // updateUsuario: Función asíncrona para actualizar un usuario existente.
  // Recibe el 'id' del usuario a actualizar, un objeto 'data' con los campos a modificar,
  // y opcionalmente un array 'newRoles' con el ID del rol único para asignar.
  updateUsuario: async (id, data, newRoles = null) => {
    // Primero actualiza los datos básicos del usuario (sin roles)
    const response = await usersAPI.updateComplete(id, data);
    
    // Si se proporcionaron roles, maneja la asignación por separado
    if (newRoles !== null && newRoles.length > 0) {
      // Obtiene los roles actuales del usuario
      const currentUser = await usersAPI.getById(id);
      const currentRoleIds = currentUser.data.roles ? 
        currentUser.data.roles.map(role => typeof role === 'object' ? role.id : role) : [];
      
      // Para sistema de rol único: el nuevo rol es el primer (y único) elemento
      const newRoleId = newRoles[0];
      
      // Si el usuario ya tiene este rol, no hacer nada
      if (currentRoleIds.includes(newRoleId)) {
        return response.data;
      }
      
      // Remueve todos los roles actuales
      if (currentRoleIds.length > 0) {
        await usersAPI.removeRoles(id, currentRoleIds);
      }
      
      // Asigna el nuevo rol único
      await usersAPI.assignRoles(id, [newRoleId]);
    }
    
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // resetPassword: Función asíncrona para restablecer la contraseña de un usuario.
  // Recibe el 'id' del usuario y la 'password' nueva.
  resetPassword: async (id, password) => {
    // Realiza una llamada a la API para cambiar la contraseña del usuario.
    const response = await usersAPI.resetPassword(id, password);
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // toggleStatus: Función asíncrona para cambiar el estado activo/inactivo de un usuario.
  // Recibe el 'id' del usuario y un booleano 'isActive' para el nuevo estado.
  toggleStatus: async (id, isActive) => {
    // Realiza una llamada a la API para actualizar el estado del usuario.
    const response = await usersAPI.toggleStatus(id, isActive);
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // ELIMINACIÓN TEMPORAL Y PERMANENTE

  // softDeleteUsuario: Función asíncrona para eliminar temporalmente un usuario (marcarlo como eliminado).
  // Recibe el 'id' del usuario a eliminar.
  softDeleteUsuario: async (id) => {
    // Realiza una llamada DELETE a la API para eliminar el usuario de forma definitiva.
    const response = await usersAPI.softDelete(id);
    // Retorna el 'status' de la respuesta HTTP (ej. 204 No Content).
    return response.status;
  },

  // hardDeleteUsuario: Función asíncrona para eliminar permanentemente un usuario.
  // Recibe el 'id' del usuario a eliminar.
  hardDeleteUsuario: async (id) => {
    // Realiza una llamada DELETE a la API para eliminar el usuario de forma definitiva.
    const response = await usersAPI.hardDelete(id);
    // Retorna el 'status' de la respuesta HTTP (ej. 204 No Content).
    return response.status;
  },

  // RESTAURAR USUARIO

  // restoreUsuario: Función asíncrona para restaurar un usuario previamente eliminado temporalmente.
  // Recibe el 'id' del usuario a restaurar.
  restoreUsuario: async (id) => {
    // Realiza una llamada PATCH a la API para actualizar el campo 'eliminado' a 'false'.
    const response = await usersAPI.restoreUser(id, { eliminado: false });
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },

  // ROLES

  // getRoles: Función asíncrona para obtener todos los roles disponibles.
  // Recibe un objeto 'params' opcional para filtros.
  getRoles: async (params = {}) => {
    // Realiza una llamada GET a la API de roles.
    const response = await rolesAPI.getAll(params);
    // Retorna la propiedad 'data' de la respuesta.
    return response.data;
  },
};
