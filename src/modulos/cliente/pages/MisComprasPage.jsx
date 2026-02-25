// src/modulos/cliente/pages/MisComprasPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { clientAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSpinner, faEye, faDollarSign, faCalendarAlt, faBox } from '@fortawesome/free-solid-svg-icons';
import VentaTable from '../../ventas/pages/components/VentaTable';
import VentaDetalleModal from '../../ventas/pages/components/VentaDetalleModal';
import { showNotification } from '../../../utils/notifications';
import { formatCurrency } from '../../../utils/formatters';

const MisComprasPage = () => {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalGastado: 0,
    ultimaCompra: null,
    productosComprados: 0
  });

  // Cargar compras del cliente usando endpoint específico
  const loadCompras = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando compras del cliente...');
      const result = await clientAPI.getVentas();
      console.log('📋 Respuesta de clientAPI.getVentas():', result);
      
      if (result.success && result.data) {
        // Manejar estructura anidada: result.data.data contiene los datos reales
        const responseData = result.data.data || result.data;
        const ventasArray = Array.isArray(responseData) ? responseData : [];
        console.log('🛒 Compras encontradas:', ventasArray);
        setCompras(ventasArray);
        
        // Calcular estadísticas
        const totalGastado = ventasArray.reduce((sum, compra) => sum + parseFloat(compra.total || 0), 0);
        const productosComprados = ventasArray.reduce((sum, compra) => 
          sum + (compra.detalles?.length || 0), 0
        );
        const ultimaCompra = ventasArray.length > 0 
          ? ventasArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
          : null;

        setStats({
          total: ventasArray.length,
          totalGastado,
          ultimaCompra,
          productosComprados
        });
      } else if (result.data) {
        // Manejo alternativo si no tiene success pero tiene data
        const responseData = result.data.data || result.data;
        const ventasArray = Array.isArray(responseData) ? responseData : [];
        console.log('🛒 Compras encontradas (sin success):', ventasArray);
        setCompras(ventasArray);
        
        const totalGastado = ventasArray.reduce((sum, compra) => sum + parseFloat(compra.total || 0), 0);
        const productosComprados = ventasArray.reduce((sum, compra) => 
          sum + (compra.detalles?.length || 0), 0
        );
        const ultimaCompra = ventasArray.length > 0 
          ? ventasArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
          : null;

        setStats({
          total: ventasArray.length,
          totalGastado,
          ultimaCompra,
          productosComprados
        });
      } else {
        console.log('❌ No se encontraron datos de compras');
        setCompras([]);
      }
    } catch (error) {
      console.error('❌ Error loading compras:', error);
      showNotification.error('Error al cargar las compras');
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompras();
  }, [user]);

  // Handler para ver detalles
  const handleView = (compra) => {
    setSelectedCompra(compra);
    setShowDetalleModal(true);
  };

  // Permisos específicos para cliente (solo lectura)
  const clientPermissions = {
    canEdit: false,
    canDelete: false,
    canRestore: false,
    canHardDelete: false,
    canToggleActivo: false
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
        <span className="ml-3 text-lg">Cargando mis compras...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Mis Compras
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Historial de todas tus compras realizadas
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Compras</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Gastado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(stats.totalGastado)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Productos Comprados</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {stats.productosComprados}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FontAwesomeIcon icon={faBox} className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Última Compra</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {stats.ultimaCompra 
                    ? new Date(stats.ultimaCompra.fecha).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de compras */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Historial de Compras ({compras.length})
            </h2>
          </div>
          
          <VentaTable
            ventas={compras}
            permissions={clientPermissions}
            onView={handleView}
            onEdit={() => {}}
            onSoftDelete={() => {}}
            onHardDelete={() => {}}
            onRestore={() => {}}
            onToggleActivo={() => {}}
            loading={loading}
            showClientColumn={false} // No mostrar columna cliente ya que todas son del mismo cliente
            title="Compras"
          />
        </div>

        {/* Modal de detalles */}
        {showDetalleModal && selectedCompra && (
          <VentaDetalleModal
            isOpen={showDetalleModal}
            onClose={() => setShowDetalleModal(false)}
            venta={selectedCompra}
            title="Detalle de Compra"
          />
        )}
      </div>
    </div>
  );
};

export default MisComprasPage;
