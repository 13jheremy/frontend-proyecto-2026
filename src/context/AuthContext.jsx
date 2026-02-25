// src/context/AuthContext.jsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { MESSAGES } from '../utils/constants';
import { getPrimaryRole, getRoleNames } from '../utils/rolePermissions';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  roles: [],
  primaryRole: null
};

// Tipos de acciones
const AUTH_TYPES = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_TYPES.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_TYPES.LOGIN_SUCCESS:
      const loginRoles = (action.payload.user?.roles || []).map(role => {
        if (typeof role === 'string') return role.toLowerCase();
        if (typeof role === 'object' && role.nombre) return role.nombre.toLowerCase();
        return null;
      }).filter(Boolean);
      
      return {
        ...state,
        user: {
          ...action.payload.user,
          roles: loginRoles  // Sobrescribir roles en user con versión normalizada
        },
        token: action.payload.access,
        refreshToken: action.payload.refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        roles: loginRoles,
        primaryRole: getPrimaryRole(loginRoles)
      };

    case AUTH_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        roles: [],
        primaryRole: null
      };

    case AUTH_TYPES.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_TYPES.LOAD_USER_START:
      return {
        ...state,
        isLoading: true
      };

    case AUTH_TYPES.LOAD_USER_SUCCESS:
      const userRoles = (action.payload?.roles || []).map(role => {
        if (typeof role === 'string') return role.toLowerCase();
        if (typeof role === 'object' && role.nombre) return role.nombre.toLowerCase();
        return null;
      }).filter(Boolean);
      
      
      return {
        ...state,
        user: {
          ...action.payload,
          roles: userRoles  // Sobrescribir roles en user con versión normalizada
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        roles: userRoles,
        primaryRole: getPrimaryRole(userRoles)
      };

    case AUTH_TYPES.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        roles: [],
        primaryRole: null
      };

    case AUTH_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_TYPES.UPDATE_USER:
      const updateRoles = (action.payload?.roles || state.roles).map(role => {
        if (typeof role === 'string') return role.toLowerCase();
        if (typeof role === 'object' && role.nombre) return role.nombre.toLowerCase();
        return null;
      }).filter(Boolean);
      
      return {
        ...state,
        user: { 
          ...state.user, 
          ...action.payload,
          roles: updateRoles  // Sobrescribir roles en user con versión normalizada
        },
        roles: updateRoles,
        primaryRole: getPrimaryRole(updateRoles)
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para login
  const login = async (correo_electronico, password) => {
    try {
      dispatch({ type: AUTH_TYPES.LOGIN_START });

      const result = await authAPI.login(correo_electronico, password);
      
      if (result.success) {
        // Guardar tokens en localStorage
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        // No guardar user_data aquí directamente, loadUser lo hará con datos completos
        // localStorage.setItem('user_data', JSON.stringify(result.data.user)); // <-- ELIMINADA/COMENTADA

        // Despachar LOGIN_SUCCESS con los datos mínimos del login (tokens)
        // El 'user' completo se obtendrá y despachará en loadUser()
        dispatch({
          type: AUTH_TYPES.LOGIN_SUCCESS,
          payload: {
            access: result.data.access,
            refresh: result.data.refresh,
            user: null // El usuario se establecerá completamente después de loadUser()
          }
        });

        // Después de un login exitoso, SIEMPRE carga los datos completos del usuario
        await loadUser(); // <-- AÑADIDA ESTA LÍNEA

        return { success: true };
      } else {
        dispatch({
          type: AUTH_TYPES.LOGIN_FAILURE,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      // Manejar diferentes tipos de errores de login
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos';
        } else if (status === 400) {
          errorMessage = data.detail || data.error || 'Datos de acceso inválidos';
        } else if (status === 403) {
          errorMessage = 'Cuenta desactivada o sin permisos';
        } else if (status >= 500) {
          errorMessage = 'Error del servidor. Intente más tarde';
        } else {
          errorMessage = data.detail || data.error || 'Error al iniciar sesión';
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }
      
      dispatch({
        type: AUTH_TYPES.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función para logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      dispatch({ type: AUTH_TYPES.LOGOUT });
    }
  };

  // Función para cargar usuario
  const loadUser = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      dispatch({ type: AUTH_TYPES.LOAD_USER_FAILURE, payload: 'No se encontró token de autenticación' });
      return;
    }

    try {
      dispatch({ type: AUTH_TYPES.LOAD_USER_START });

      const result = await authAPI.getMe();
      
      if (result.success) {
        console.log('API getMe response:', result.data);
        
        // Actualizar datos en localStorage con la respuesta COMPLETA de getMe
        localStorage.setItem('user_data', JSON.stringify(result.data));
        
        dispatch({
          type: AUTH_TYPES.LOAD_USER_SUCCESS,
          payload: result.data
        });
      } else {
        console.error('Error loading user:', result.error);
        // Si falla la carga del usuario, hacer logout
        logout();
      }
    } catch (error) {
      console.error('loadUser catch:', error);
      dispatch({
        type: AUTH_TYPES.LOAD_USER_FAILURE,
        payload: error.message || 'Error al cargar datos del usuario'
      });
      logout();
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const result = await authAPI.changePassword(oldPassword, newPassword);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cambiar la contraseña'
      };
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_TYPES.UPDATE_USER,
      payload: userData
    });
    
    // Actualizar localStorage
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_TYPES.CLEAR_ERROR });
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Cargar datos del localStorage primero para evitar múltiples llamadas
        dispatch({
          type: AUTH_TYPES.LOAD_USER_SUCCESS,
          payload: parsedUser
        });
        
        // Luego verificar/actualizar con la API de forma silenciosa
        loadUser().catch(console.error);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        loadUser();
      }
    } else if (token) {
      // Si hay token pero no datos de usuario, cargar desde API
      loadUser(); 
    } else {
      // Si no hay token, el usuario no está autenticado
      dispatch({ type: AUTH_TYPES.LOAD_USER_FAILURE, payload: 'No hay datos de autenticación' });
    }
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

  // Valores del contexto
  const contextValue = {
    // Estado
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    roles: state.roles,
    primaryRole: state.primaryRole,
    roleNames: getRoleNames(state.roles),

    // Acciones
    login,
    logout,
    loadUser,
    changePassword,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
