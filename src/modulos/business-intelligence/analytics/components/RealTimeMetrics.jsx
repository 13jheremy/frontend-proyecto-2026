// src/modulos/business-intelligence/analytics/components/RealTimeMetrics.jsx

import React from 'react';

const RealTimeMetrics = ({ data }) => {
  // Datos por defecto si no hay data
  const defaultData = {
    ventasHoy: 0,
    ingresosHoy: 0,
    mantenimientosActivos: 0,
    stockBajo: 0,
    clientesActivos: 0,
    eficienciaOperativa: 0
  };

  const metrics = data || defaultData;

  const MetricCard = ({ title, value, icon, color, trend, subtitle }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-800/20 rounded-xl p-6 border border-${color}-200 dark:border-${color}-800`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-8 h-8 bg-${color}-500 rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
            <h3 className={`text-sm font-medium text-${color}-800 dark:text-${color}-200`}>
              {title}
            </h3>
          </div>
          
          <div className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100 mb-1`}>
            {value}
          </div>
          
          {subtitle && (
            <p className={`text-xs text-${color}-600 dark:text-${color}-300`}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center text-xs ${
                trend.direction === 'up' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={trend.direction === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                {trend.value}
              </div>
              <span className={`text-xs text-${color}-500 dark:text-${color}-400 ml-2`}>
                vs. ayer
              </span>
            </div>
          )}
        </div>
        
        {/* Indicador en tiempo real */}
        <div className="flex flex-col items-end">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mb-1"></div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Ventas Hoy */}
      <MetricCard
        title="Ventas Hoy"
        value={metrics.ventasHoy?.toLocaleString() || '0'}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
        color="green"
        trend={{
          direction: 'up',
          value: '+12.5%'
        }}
        subtitle="Transacciones completadas"
      />

      {/* Ingresos Hoy */}
      <MetricCard
        title="Ingresos Hoy"
        value={`Bs. ${metrics.ingresosHoy?.toLocaleString() || '0'}`}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        }
        color="blue"
        trend={{
          direction: 'up',
          value: '+8.3%'
        }}
        subtitle="Facturación del día"
      />

      {/* Mantenimientos Activos */}
      <MetricCard
        title="Mantenimientos Activos"
        value={metrics.mantenimientosActivos?.toLocaleString() || '0'}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        }
        color="yellow"
        trend={{
          direction: 'down',
          value: '-3.2%'
        }}
        subtitle="En proceso/pendientes"
      />

      {/* Stock Bajo */}
      <MetricCard
        title="Productos Stock Bajo"
        value={metrics.stockBajo?.toLocaleString() || '0'}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        color="red"
        trend={{
          direction: 'up',
          value: '+2'
        }}
        subtitle="Requieren reposición"
      />

      {/* Clientes Activos */}
      <MetricCard
        title="Clientes Activos"
        value={metrics.clientesActivos?.toLocaleString() || '0'}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        color="indigo"
        trend={{
          direction: 'up',
          value: '+5.7%'
        }}
        subtitle="Últimos 30 días"
      />

      {/* Eficiencia Operativa */}
      <MetricCard
        title="Eficiencia Operativa"
        value={`${metrics.eficienciaOperativa || '87'}%`}
        icon={
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        color="purple"
        trend={{
          direction: 'up',
          value: '+1.2%'
        }}
        subtitle="Rendimiento general"
      />
    </div>
  );
};

export default RealTimeMetrics;
