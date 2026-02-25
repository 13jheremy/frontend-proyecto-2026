// src/modulos/perfil/hooks/usePerfil.js
import { useCallback, useEffect, useState } from 'react';
import { obtenerPerfil, actualizarPerfil, cambiarPassword } from '../api/perfilAPI';

export default function usePerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerPerfil();
      setPerfil(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePerfil = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const userId = perfil?.user?.id || perfil?.id;
      const data = await actualizarPerfil(userId, payload);
      setPerfil(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  useEffect(() => { fetchPerfil().catch(() => {}); }, [fetchPerfil]);

  return { perfil, loading, error, fetchPerfil, updatePerfil, changePassword };
}


