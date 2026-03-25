import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NuevaVentaPage from '../pages/NuevaVentaPage';

const POSRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/nueva-venta" replace />} />
      <Route path="nueva-venta" element={<NuevaVentaPage />} />
    </Routes>
  );
};

export default POSRoutes;
