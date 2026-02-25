// src/modulos/business-intelligence/analytics/components/LiveChart.jsx

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const LiveChart = ({ type, data, title, color = '#3B82F6', height = 300 }) => {
  const chartRef = useRef();

  // Configuración base para todos los gráficos
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748B',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: '#1E293B',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 1
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Datos por defecto
  const defaultData = {
    line: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{
        label: 'Ventas por Hora',
        data: [12, 19, 15, 25, 22, 18],
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4,
        fill: true
      }]
    },
    bar: {
      labels: ['Repuestos', 'Aceites', 'Filtros', 'Llantas', 'Baterías'],
      datasets: [{
        label: 'Margen (%)',
        data: [25, 35, 20, 40, 30],
        backgroundColor: [
          '#10B981',
          '#3B82F6', 
          '#8B5CF6',
          '#F59E0B',
          '#EF4444'
        ],
        borderRadius: 4
      }]
    },
    radar: {
      labels: ['Velocidad', 'Calidad', 'Satisfacción', 'Eficiencia', 'Puntualidad'],
      datasets: [{
        label: 'Técnico A',
        data: [85, 90, 88, 92, 87],
        borderColor: color,
        backgroundColor: `${color}30`,
        pointBackgroundColor: color
      }, {
        label: 'Técnico B',
        data: [78, 85, 82, 88, 90],
        borderColor: '#EF4444',
        backgroundColor: '#EF444430',
        pointBackgroundColor: '#EF4444'
      }]
    },
    doughnut: {
      labels: ['VIP', 'Frecuente', 'Ocasional', 'Nuevo'],
      datasets: [{
        data: [25, 35, 30, 10],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B', 
          '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    }
  };

  // Seleccionar datos según el tipo
  const chartData = data && data.length > 0 ? data : defaultData[type];

  // Opciones específicas por tipo de gráfico
  const getSpecificOptions = () => {
    switch (type) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                color: '#E2E8F0'
              },
              ticks: {
                color: '#64748B'
              }
            },
            y: {
              grid: {
                color: '#E2E8F0'
              },
              ticks: {
                color: '#64748B'
              }
            }
          }
        };
      
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748B'
              }
            },
            y: {
              grid: {
                color: '#E2E8F0'
              },
              ticks: {
                color: '#64748B',
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        };
      
      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              angleLines: {
                color: '#E2E8F0'
              },
              grid: {
                color: '#E2E8F0'
              },
              pointLabels: {
                color: '#64748B',
                font: {
                  size: 11
                }
              },
              ticks: {
                color: '#64748B',
                backdropColor: 'transparent'
              }
            }
          }
        };
      
      case 'doughnut':
        return {
          ...baseOptions,
          cutout: '60%',
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: 'bottom'
            }
          }
        };
      
      default:
        return baseOptions;
    }
  };

  // Renderizar el gráfico según el tipo
  const renderChart = () => {
    const options = getSpecificOptions();
    
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case 'radar':
        return <Radar ref={chartRef} data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={options} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            Tipo de gráfico no soportado: {type}
          </div>
        );
    }
  };

  // Efecto para actualizar el gráfico cuando cambien los datos
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('active');
    }
  }, [data]);

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      {chartData ? (
        renderChart()
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-500 text-sm">Cargando datos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChart;
