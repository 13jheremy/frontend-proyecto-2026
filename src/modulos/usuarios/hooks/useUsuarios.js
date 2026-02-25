// Este hook personalizado encapsula la lógica de gestión de usuarios,
// incluyendo la obtención, creación, actualización, eliminación y manejo de roles,
// así como la gestión de estados de carga, errores y paginación.

import { useState, useEffect, useCallback } from 'react';
import { usuarioApi } from '../api/index'; // Importa la API de usuarios.
import { personsAPI } from '../../../services/api'; // Importa la API de personas.
import { handleApiError, handleUserCreationError, showNotification, userMessages } from '../../../utils/notifications'; // Importa utilidades de notificación y manejo de errores.

export const useUsuarios = () => {
  // Estado para almacenar la lista de usuarios (incluyendo personas sin usuario).
  const [usuarios, setUsuarios] = useState([]);
  // Estado para almacenar la lista de roles disponibles.
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  // Estado para indicar si una operación está en curso (ej. carga de datos).
  const [loading, setLoading] = useState(false);
  // Estado para almacenar cualquier error que ocurra durante las operaciones de la API.
  const [error, setError] = useState(null);
  // Estado para gestionar la información de paginación.
  const [pagination, setPagination] = useState({
    page: 1, // Página actual.
    pageSize: 10, // Cantidad de elementos por página.
    totalItems: 0, // Número total de elementos.
    totalPages: 0, // Número total de páginas.
  });

  // clearError: Función para limpiar el estado de error.
  // Utiliza useCallback para memorizar la función y evitar recreaciones innecesarias.
  const clearError = useCallback(() => {
    setError(null); // Establece el error a null.
  }, []); // No tiene dependencias, por lo que solo se crea una vez.

  // processFilters: Función auxiliar para transformar los filtros del frontend
  // a un formato compatible con los parámetros de la API.
  const processFilters = (filters) => {
    const params = { ...filters }; // Crea una copia de los filtros para no mutar el original.

    // Si 'is_active' está definido y no es una cadena vacía, lo renombra a 'activo' y lo convierte a string.
    if (params.is_active !== undefined && params.is_active !== '') {
      params.activo = String(params.is_active);
      delete params.is_active; // Elimina la propiedad original.
    }

    // Si 'roles' es un array y tiene elementos, los une en una cadena separada por comas.
    if (Array.isArray(params.roles) && params.roles.length > 0) {
      params.roles = params.roles.join(',');
    } else if (Array.isArray(params.roles) && params.roles.length === 0) {
      // Si 'roles' es un array vacío, lo elimina de los parámetros.
      delete params.roles;
    }

    // Si 'eliminado' está definido y no es una cadena vacía, lo convierte a string.
    if (params.eliminado !== undefined && params.eliminado !== '') {
      params.eliminado = String(params.eliminado);
    }

    return params; // Retorna los parámetros procesados.
  };

  // fetchUsuarios: Función asíncrona para obtener usuarios y personas sin usuario de la API.
  // Incluye manejo de filtros, paginación y errores.
  const fetchUsuarios = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      const processedFilters = processFilters(filters); // Procesa los filtros.
      const params = {
        ...processedFilters, // Incluye los filtros procesados.
        page, // Número de página.
        page_size: pageSize, // Tamaño de la página.
      };

      // Obtener usuarios y personas sin usuario en paralelo
      const [usuariosResponse, personasResponse] = await Promise.all([
        usuarioApi.getUsuarios(params),
        personsAPI.getWithoutUser()
      ]);

      let usuariosCombinados = [];

      // Procesar usuarios si hay datos
      if (usuariosResponse && usuariosResponse.results) {
        usuariosCombinados = [...usuariosResponse.results];
      }

      // Procesar personas sin usuario si hay datos
      if (personasResponse && personasResponse.success && personasResponse.data) {
        const personasFormateadas = personasResponse.data.map(persona => ({
          ...persona,
          id: `persona_${persona.id}`, // Prefijo para distinguir de usuarios reales
          username: 'Sin usuario',
          email: persona.email || 'No especificado',
          is_active: true,
          eliminado: false,
          roles: [],
          fecha_creacion: persona.fecha_creacion,
          fecha_actualizacion: persona.fecha_actualizacion,
          es_persona_sin_usuario: true, // Flag para identificar que es una persona sin usuario
          persona_asociada: persona
        }));
        usuariosCombinados = [...usuariosCombinados, ...personasFormateadas];
      }

      // Actualizar estados
      if (usuariosResponse && usuariosResponse.results) {
        const totalItems = usuariosResponse.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setUsuarios(usuariosCombinados); // Actualiza la lista combinada.
        setPagination({ // Actualiza la información de paginación.
          page,
          pageSize,
          totalItems,
          totalPages,
          next: usuariosResponse.next,
          previous: usuariosResponse.previous,
        });
      }
    } catch (err) {
      // Captura y maneja los errores de la API.
      const apiError = handleApiError(err); // Procesa el error para obtener un formato legible.
      setError(apiError); // Establece el error.
      setUsuarios([]); // Limpia la lista de usuarios en caso de error.
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 }); // Restablece la paginación.
    } finally {
      setLoading(false); // Desactiva el estado de carga, independientemente del resultado.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).


  // fetchRolesDisponibles: Función asíncrona para obtener los roles disponibles de la API.
  const fetchRolesDisponibles = useCallback(async () => {
    try {
      const data = await usuarioApi.getRoles(); // Llama a la API para obtener roles.
      // Si la respuesta contiene 'results' (formato de paginación) o es un array directo, actualiza los roles.
      if (data && data.results) {
        setRolesDisponibles(data.results);
      } else if (Array.isArray(data)) {
        setRolesDisponibles(data);
      } else {
        setRolesDisponibles([]); // Si el formato es inesperado, establece un array vacío.
      }
    } catch (err) {
      setRolesDisponibles([]); // Limpia los roles en caso de error.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // createUsuario: Función asíncrona para crear un usuario simple.
  const createUsuario = useCallback(async (usuarioData) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      const data = await usuarioApi.createSimple(usuarioData); // Llama a la API para crear el usuario.
      showNotification.success(userMessages.userCreated); // Muestra una notificación de éxito.
      return data; // Retorna los datos del usuario creado.
    } catch (err) {
      // Captura y maneja los errores de la API durante la creación.
      const apiError = handleUserCreationError(err); // Procesa el error para obtener mensajes específicos.
      setError(apiError); // Establece el error.

      // Solo muestra una notificación general si no hay errores de campo específicos.
      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError; // Relanza el error para que el componente que llama pueda manejarlo.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // createUsuarioComplete: Función asíncrona para crear un usuario completo (con datos de persona).
  const createUsuarioComplete = useCallback(async (usuarioData) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      const data = await usuarioApi.createComplete(usuarioData); // Llama a la API para crear el usuario completo.
      showNotification.success(userMessages.userCreatedComplete); // Muestra una notificación de éxito.
      return data; // Retorna los datos del usuario creado.
    } catch (err) {
      // Captura y maneja los errores de la API durante la creación.
      const apiError = handleUserCreationError(err); // Procesa el error.
      setError(apiError); // Establece el error.

      // Solo muestra una notificación general si no hay errores de campo específicos.
      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // updateUsuario: Función asíncrona para actualizar un usuario existente.
  const updateUsuario = useCallback(async (id, usuarioData) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      const data = await usuarioApi.updateUsuario(id, usuarioData); // Llama a la API para actualizar el usuario.
      showNotification.success(userMessages.userUpdated); // Muestra una notificación de éxito.
      return data; // Retorna los datos del usuario actualizado.
    } catch (err) {
      // Captura y maneja los errores de la API durante la actualización.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.

      // Solo muestra una notificación general si no hay errores de campo específicos.
      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // softDeleteUsuario: Función asíncrona para eliminar temporalmente un usuario.
  const softDeleteUsuario = useCallback(async (id) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      await usuarioApi.softDeleteUsuario(id); // Llama a la API para la eliminación temporal.
      showNotification.success(userMessages.userSoftDeleted); // Muestra una notificación de éxito.
    } catch (err) {
      // Captura y maneja los errores.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.
      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // hardDeleteUsuario: Función asíncrona para eliminar permanentemente un usuario.
  const hardDeleteUsuario = useCallback(async (id) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      await usuarioApi.hardDeleteUsuario(id); // Llama a la API para la eliminación permanente.
      showNotification.success(userMessages.userHardDeleted); // Muestra una notificación de éxito.
    } catch (err) {
      // Captura y maneja los errores.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.
      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // restoreUsuario: Función asíncrona para restaurar un usuario eliminado temporalmente.
  const restoreUsuario = useCallback(async (id) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      await usuarioApi.restoreUsuario(id); // Llama a la API para restaurar el usuario.
      showNotification.success(userMessages.userRestored); // Muestra una notificación de éxito.
    } catch (err) {
      // Captura y maneja los errores.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.
      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // resetPassword: Función asíncrona para restablecer la contraseña de un usuario.
  const resetPassword = useCallback(async (id, newPassword) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      const result = await usuarioApi.resetPassword(id, newPassword); // Llama a la API para restablecer la contraseña.
      showNotification.success(userMessages.passwordReset); // Muestra una notificación de éxito.
      return result; // Retorna el resultado de la operación.
    } catch (err) {
      // Captura y maneja los errores.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.
      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // toggleUserStatus: Función asíncrona para cambiar el estado activo/inactivo de un usuario.
  const toggleUserStatus = useCallback(async (id, isActive) => {
    setLoading(true); // Activa el estado de carga.
    setError(null); // Limpia cualquier error previo.

    try {
      await usuarioApi.toggleStatus(id, isActive); // Llama a la API para cambiar el estado.
      showNotification.success(userMessages.statusChanged(isActive)); // Muestra una notificación de éxito.
    } catch (err) {
      // Captura y maneja los errores.
      const apiError = handleApiError(err); // Procesa el error.
      setError(apiError); // Establece el error.
      throw apiError; // Relanza el error.
    } finally {
      setLoading(false); // Desactiva el estado de carga.
    }
  }, []); // Dependencias: se recrea si alguna de sus dependencias cambia (actualmente ninguna).

  // handleUserAction: Función unificada para manejar diferentes acciones de usuario.
  // Simplifica la lógica en los componentes al centralizar las llamadas a las funciones específicas.
  const handleUserAction = useCallback(async (userId, actionType, additionalData = null) => {
    try {
      // Utiliza un switch para ejecutar la función de acción correcta según 'actionType'.
      switch (actionType) {
        case 'softDelete':
          await softDeleteUsuario(userId); // Llama a la función de eliminación temporal.
          break;
        case 'hardDelete':
          await hardDeleteUsuario(userId); // Llama a la función de eliminación permanente.
          break;
        case 'restore':
          await restoreUsuario(userId); // Llama a la función de restauración.
          break;
        case 'toggleStatus':
          // Encuentra el usuario en el estado actual para determinar su estado activo.
          const user = usuarios.find(u => u.id === userId);
          if (user) {
            await toggleUserStatus(userId, !user.is_active); // Llama a la función para cambiar el estado.
          }
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`); // Lanza un error si la acción no es válida.
      }
    } catch (err) {
      throw err; // Relanza el error.
    }
  }, [usuarios, softDeleteUsuario, hardDeleteUsuario, restoreUsuario, toggleUserStatus]); // Dependencias: se recrea si alguna de estas funciones o 'usuarios' cambia.

  // useEffect de inicialización: Se ejecuta una vez al montar el componente.
  // Carga los roles disponibles y los usuarios (incluyendo personas sin usuario).
  useEffect(() => {
    fetchRolesDisponibles(); // Obtiene los roles.
    fetchUsuarios(); // Obtiene los usuarios y personas sin usuario.
  }, [fetchUsuarios, fetchRolesDisponibles]); // Dependencias: se ejecuta si estas funciones cambian.

  // Retorna un objeto con los estados y funciones que el componente que usa el hook necesita.
  return {
    // Estados:
    usuarios,
    rolesDisponibles,
    loading,
    error,
    pagination,

    // Funciones principales de la API:
    fetchUsuarios,
    createUsuario,
    createUsuarioComplete,
    updateUsuario,
    resetPassword,

    // Funciones de gestión de estado y acciones:
    softDeleteUsuario,
    hardDeleteUsuario,
    restoreUsuario,
    toggleUserStatus,
    handleUserAction, // Función unificada para acciones.

    // Utilidades:
    clearError, // Función para limpiar errores.
  };
};
