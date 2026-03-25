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
    case 'SET_INITIAL_STATE':
      // NUNCA tocar el error - preservar siempre el error existente
      return {
        ...state,
        ...action.payload,
        error: state.error  // preservar siempre
      };

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
        // NO resetear error aquí, solo en LOGIN_FAILURE y CLEAR_ERROR
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
  const login = async (correo_electronico, password, rememberMe = false) => {
    try {
      dispatch({ type: AUTH_TYPES.LOGIN_START });

      const result = await authAPI.login(correo_electronico, password);
      
      if (result.success) {
        // Guardar tokens en localStorage
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        // Guardar preferencia rememberMe
        localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');

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

        // Después de un login exitoso, carga los datos completos del usuario
        await loadUser();

        return { success: true };
      } else {
        // Login fallido - NO guardar nada en localStorage
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
          // Verificar si hay mensajes específicos de lockout
          if (data.locked) {
            errorMessage = data.error || 'Cuenta bloqueada por demasiados intentos';
          } else {
            errorMessage = data.detail || data.error || 'Usuario o contraseña incorrectos';
          }
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
        if (!navigator.onLine) {
          errorMessage = 'Error de conexión. No hay acceso a internet.';
        } else {
          errorMessage = 'Error de conexión con la base de datos.';
        }
      } else {
        errorMessage = error.message || 'Error inesperado';
      }
      
      dispatch({
        type: AUTH_TYPES.LOGIN_FAILURE,
        payload: errorMessage
      });
      
      // No llamar a loadUser() cuando login falla
      return { success: false, error: errorMessage };
    }
  };

  // Función para logout
  const logout = async () => {
    console.log('🔴 logout() llamado');
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.log('🔴 Error en logout (catch):', error);
    } finally {
      // SIEMPRE limpiar localStorage, sin importar si el logout fue exitoso o falló
      console.log('🔴 Limpiando localStorage...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('remember_me');
      
      dispatch({ type: AUTH_TYPES.LOGOUT });
      console.log('🔴 Logout completado');
    }
  };

  // Función para cargar usuario
  const loadUser = async () => {
    const token = localStorage.getItem('access_token');
    
    // Si no hay token, solo setear isLoading: false, NO tocar el error
    if (!token) {
      dispatch({ 
        type: 'SET_INITIAL_STATE',
        payload: { isLoading: false, isAuthenticated: false }
      });
      return;
    }

    try {
      dispatch({ type: AUTH_TYPES.LOAD_USER_START });

      const result = await authAPI.getMe();
      
      if (result.success) {
        // Actualizar datos en localStorage con la respuesta COMPLETA de getMe
        localStorage.setItem('user_data', JSON.stringify(result.data));
        
        dispatch({
          type: AUTH_TYPES.LOAD_USER_SUCCESS,
          payload: result.data
        });
      } else {
        // Si falla la carga del usuario, hacer logout
        logout();
      }
    } catch (error) {
      // En caso de error, solo limpiar sin afectar el error existente
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      dispatch({ 
        type: 'SET_INITIAL_STATE',
        payload: { isLoading: false, isAuthenticated: false }
      });
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const result = await authAPI.changePassword(oldPassword, newPassword);
      return result;
    } catch (error) {
      let errorMessage = 'Error al cambiar la contraseña';
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data.detail || data.error || 'Datos inválidos. Verifique la contraseña actual.';
        } else if (status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        } else if (status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción.';
        } else if (status >= 500) {
          errorMessage = 'Error del servidor. Intente más tarde.';
        } else {
          errorMessage = data.detail || data.error || 'Error al cambiar la contraseña';
        }
      } else if (error.request) {
        if (!navigator.onLine) {
          errorMessage = 'Error de conexión. No hay acceso a internet.';
        } else {
          errorMessage = 'Error de conexión con la base de datos.';
        }
      } else {
        errorMessage = error.message || 'Error al cambiar la contraseña';
      }
      
      return {
        success: false,
        error: errorMessage
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
    
    // SOLO cargar datos si tenemos token Y userData Y el usuario NO está en proceso de login
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
      // Solo setear isLoading: false, nada más (no afectar el error existente)
      dispatch({
        type: 'SET_INITIAL_STATE',
        payload: { isLoading: false }
      });
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
