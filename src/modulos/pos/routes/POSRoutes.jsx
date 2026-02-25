import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NuevaVentaPage from '../pages/NuevaVentaPage';
import NuevoMantenimientoPOSPage from '../pages/NuevoMantenimientoPOSPage';

const POSRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/nueva-venta" replace />} />
      <Route path="nueva-venta" element={<NuevaVentaPage />} />
      <Route path="nuevo-mantenimiento-pos" element={<NuevoMantenimientoPOSPage />} />
    </Routes>
  );
};

export default POSRoutes;
