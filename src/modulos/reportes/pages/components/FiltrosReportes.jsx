// src/modulos/reportes/pages/components/FiltrosReportes.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faBox as faBoxProduct, faSearch, faFilter, faMotorcycle, faUserGear, faBox } from '@fortawesome/free-solid-svg-icons';
import api from '@/services/api';

const FiltrosReportes = ({ 
  onGenerate, 
  loading = false, 
  tipo = 'ventas',
  showClientFilter = true,
  showProductFilter = true,
  showGroupBy = true,
  showExportButtons = true
}) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [motos, setMotos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [motoId, setMotoId] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [estado, setEstado] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const toISO = (d) => d.toISOString().slice(0, 10);
    setFechaInicio((prev) => prev || toISO(start));
    setFechaFin((prev) => prev || toISO(today));
    
    loadOptions();
  }, [tipo]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const promises = [
        api.get('/personas/?solo_clientes=true'),
      ];
      
      if (tipo === 'mantenimientos') {
        promises.push(api.get('/motos/'));
        promises.push(api.get('/pos/tecnicos/buscar/'));
      } else {
        promises.push(api.get('/productos/activos/'));
      }
      
      const results = await Promise.all(promises);
      
      if (tipo === 'mantenimientos') {
        const tecnicosResponse = results[2];
        const tecnicosData = tecnicosResponse.data.data || tecnicosResponse.data.results || tecnicosResponse.data || [];
        setClientes(results[0].data.results || results[0].data || []);
        setMotos(results[1].data.results || results[1].data || []);
        setTecnicos(tecnicosData);
      } else {
        setClientes(results[0].data.results || results[0].data || []);
        setProductos(results[1].data.results || results[1].data || []);
      }
    } catch (e) {
      console.error('Error loading options:', e);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona ambas fechas');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('Fecha inicio no puede ser mayor que fin');
      return;
    }

    const params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };

    if (tipo === 'mantenimientos') {
      if (motoId) params.moto_id = motoId;
      if (clienteId) params.cliente_id = clienteId;
      if (estado) params.estado = estado;
      if (tecnicoId) params.tecnico_id = tecnicoId;
    } else {
      params.formato = 'json';
      if (showClientFilter && clienteId) params.cliente_id = clienteId;
      if (showProductFilter && productoId) params.producto_id = productoId;
      if (showGroupBy) params.group_by = groupBy;
    }

    onGenerate(params);
  };

  const generateFormat = (formato) => {
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona ambas fechas');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('Fecha inicio no puede ser mayor que fin');
      return;
    }

    const params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };

    if (tipo === 'mantenimientos') {
      if (motoId) params.moto_id = motoId;
      if (clienteId) params.cliente_id = clienteId;
      if (estado) params.estado = estado;
      if (tecnicoId) params.tecnico_id = tecnicoId;
    } else {
      params.formato = formato;
      if (showClientFilter && clienteId) params.cliente_id = clienteId;
      if (showProductFilter && productoId) params.producto_id = productoId;
      if (showGroupBy) params.group_by = groupBy;
    }

    onGenerate(params);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Inicio
            </label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Fin
            </label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {showClientFilter && (
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                {tipo === 'mantenimientos' ? 'Cliente' : 'Cliente'}
              </label>
              <select 
                value={clienteId} 
                onChange={(e) => setClienteId(e.target.value)}
                disabled={loadingOptions}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipo === 'mantenimientos' && (
            <>
              <div className="min-w-[140px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <FontAwesomeIcon icon={faMotorcycle} className="mr-1" />
                  Motocicleta
                </label>
                <select 
                  value={motoId} 
                  onChange={(e) => setMotoId(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {motos.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.placa} - {m.marca} {m.modelo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[100px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <FontAwesomeIcon icon={faFilter} className="mr-1" />
                  Estado
                </label>
                <select 
                  value={estado} 
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <FontAwesomeIcon icon={faUserGear} className="mr-1" />
                  Técnico
                </label>
                <select 
                  value={tecnicoId} 
                  onChange={(e) => setTecnicoId(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.username}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {showProductFilter && (
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faBox} className="mr-1" />
                Producto
              </label>
              <select 
                value={productoId} 
                onChange={(e) => setProductoId(e.target.value)}
                disabled={loadingOptions}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showGroupBy && (
            <div className="min-w-[80px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Por
              </label>
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value)} 
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Día</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {showExportButtons && (
              <>
                <button 
                  type="button"
                  onClick={() => generateFormat('pdf')}
                  disabled={loading}
                  className="px-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  PDF
                </button>
                <button 
                  type="button"
                  onClick={() => generateFormat('csv')}
                  disabled={loading}
                  className="px-2 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Excel
                </button>
              </>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faSearch} className={`mr-1 ${loading ? 'animate-pulse' : ''}`} />
              Generar
            </button>
          </div>
        </div>
        
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
};

export default FiltrosReportes;