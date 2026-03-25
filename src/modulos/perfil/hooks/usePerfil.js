// src/modulos/perfil/hooks/usePerfil.js
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { obtenerPerfil, actualizarPerfil, cambiarPassword } from '../api/perfilAPI';

export default function usePerfil() {
  const { user, roles, updateUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos del usuario desde el contexto de autenticación primero
  useEffect(() => {
    if (user) {
      // Normalizar roles a minúsculas
      const normalizedRoles = (user.roles || roles || []).map(role => {
        if (typeof role === 'string') return role.toLowerCase();
        if (typeof role === 'object' && role.nombre) return role.nombre.toLowerCase();
        return role;
      });
      
      setPerfil({
        id: user.id,
        username: user.username,
        correo_electronico: user.correo_electronico,
        first_name: user.first_name,
        last_name: user.last_name,
        persona: user.persona || {
          nombre: user.first_name,
          apellido: user.last_name,
          telefono: user.persona?.telefono || '',
          direccion: user.persona?.direccion || '',
          ci: user.persona?.ci || ''
        },
        roles: normalizedRoles,
        is_active: user.is_active,
        is_staff: user.is_staff,
        date_joined: user.date_joined
      });
    }
  }, [user, roles]);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerPerfil();
      // Normalizar roles a minúsculas
      const normalizedData = {
        ...data,
        roles: (data.roles || []).map(role => {
          if (typeof role === 'string') return role.toLowerCase();
          if (typeof role === 'object' && role.nombre) return role.nombre.toLowerCase();
          return role;
        })
      };
      setPerfil(prev => ({ ...prev, ...normalizedData }));
      return normalizedData;
    } catch (e) {
      setError(e);
      // Si falla, usamos los datos del contexto de auth
      if (user) {
        setPerfil({
          id: user.id,
          username: user.username,
          correo_electronico: user.correo_electronico,
          first_name: user.first_name,
          last_name: user.last_name,
          persona: user.persona || {
            nombre: user.first_name,
            apellido: user.last_name,
            telefono: '',
            direccion: '',
            ci: ''
          },
          roles: user.roles || roles
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, roles]);

  const updatePerfil = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const userId = perfil?.id || user?.id;
      const data = await actualizarPerfil(userId, payload);
      
      // Actualizar el estado local
      setPerfil(prev => ({ ...prev, ...data }));
      
      // Actualizar el contexto de autenticación
      if (data) {
        updateUser(data);
      }
      
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [perfil, user, updateUser]);

  const changePassword = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cambiarPassword(payload);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  });

  // Cargar perfil adicional al montar
  useEffect(() => { 
    if (!perfil) { 
      fetchPerfil().catch(() => {}); 
    }
  }, [perfil, fetchPerfil]);

  return { perfil, loading, error, fetchPerfil, updatePerfil, changePassword };
}
