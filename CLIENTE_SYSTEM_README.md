# Sistema de Funcionalidades para Clientes

## 📋 Resumen

Sistema completo de gestión para usuarios con rol `cliente` que permite acceder a funcionalidades específicas sin afectar los CRUDs administrativos existentes.

## 🚀 Funcionalidades Implementadas

### 1. Dashboard de Cliente (`/dashboard`)
- Panel principal con acceso rápido a todas las funcionalidades
- Estadísticas personalizadas del cliente
- Navegación intuitiva con tarjetas de acción

### 2. Mis Motos (`/mis-motos`)
- **Ver**: Lista de todas las motos del cliente
- **Agregar**: Registrar nuevas motocicletas
- **Editar**: Modificar información de motos existentes
- **Estadísticas**: Total, activas, en mantenimiento
- **Restricciones**: No puede eliminar motos

### 3. Mis Mantenimientos (`/mis-mantenimientos`)
- **Ver**: Historial completo de mantenimientos realizados
- **Filtrado**: Solo mantenimientos de motos del cliente
- **Estadísticas**: Pendientes, en proceso, completados
- **Restricciones**: Solo lectura

### 4. Mis Compras (`/mis-compras`)
- **Ver**: Historial de todas las compras realizadas
- **Estadísticas**: Total gastado, productos comprados, última compra
- **Detalles**: Ver información completa de cada compra
- **Restricciones**: Solo lectura

### 5. Mi Perfil (`/perfil`)
- **Editar**: Información personal (nombre, apellido, email, teléfono, dirección)
- **Protegido**: Cédula no editable por seguridad
- **Validaciones**: Campos obligatorios y formato de email

### 6. Catálogo (`/catalogo`)
- **Explorar**: Productos disponibles con stock
- **Filtros**: Por categoría, marca y búsqueda de texto
- **Detalles**: Modal con información completa del producto
- **Restricciones**: Solo productos activos

## 🔧 Arquitectura Técnica

### Estructura de Archivos
```
src/modulos/cliente/pages/
├── MisMotosPage.jsx
├── MisMantenimientosPage.jsx
├── MisComprasPage.jsx
├── MiPerfilPage.jsx
└── CatalogoPage.jsx
```

### APIs Utilizadas
- `motorcyclesAPI` - Gestión de motocicletas
- `maintenanceAPI` - Consulta de mantenimientos
- `salesAPI` - Consulta de ventas/compras
- `personsAPI` - Gestión de perfil personal
- `productsAPI` - Consulta de productos

### Componentes Reutilizados
- `MotoTable` - Tabla de motocicletas
- `MantenimientoTable` - Tabla de mantenimientos
- `VentaTable` - Tabla de ventas/compras
- `MotoCreateModal` - Modal para crear/editar motos
- `DetalleMantenimientoModal` - Modal de detalles de mantenimiento
- `VentaDetalleModal` - Modal de detalles de venta

## 🛡️ Seguridad y Permisos

### Filtrado de Datos
- **Motos**: Solo las que pertenecen al cliente (`propietario.id === user.persona.id`)
- **Mantenimientos**: Solo de motos del cliente (`moto.propietario.id === user.persona.id`)
- **Compras**: Solo las realizadas por el cliente (`cliente.id === user.persona.id`)

### Permisos por Página
| Página | Crear | Leer | Actualizar | Eliminar |
|--------|-------|------|------------|----------|
| Mis Motos | ✅ | ✅ | ✅ | ❌ |
| Mis Mantenimientos | ❌ | ✅ | ❌ | ❌ |
| Mis Compras | ❌ | ✅ | ❌ | ❌ |
| Mi Perfil | ❌ | ✅ | ✅* | ❌ |
| Catálogo | ❌ | ✅ | ❌ | ❌ |

*Excepto cédula que está protegida

### Rutas Protegidas
Todas las rutas están protegidas con `RoleGuard` que requiere rol `cliente`:
```jsx
<RoleGuard requiredRoles={['cliente']}>
  <ComponentePage />
</RoleGuard>
```

## 🔗 Configuración de Rutas

### PrivateRoutes.jsx
```jsx
// Rutas específicas para clientes
<Route path="/mis-motos" element={<RoleGuard requiredRoles={['cliente']}><MisMotosPage /></RoleGuard>} />
<Route path="/mis-mantenimientos" element={<RoleGuard requiredRoles={['cliente']}><MisMantenimientosPage /></RoleGuard>} />
<Route path="/mis-compras" element={<RoleGuard requiredRoles={['cliente']}><MisComprasPage /></RoleGuard>} />
<Route path="/perfil" element={<RoleGuard requiredRoles={['cliente']}><MiPerfilPage /></RoleGuard>} />
<Route path="/catalogo" element={<RoleGuard requiredRoles={['cliente']}><CatalogoPage /></RoleGuard>} />
```

### constants.js
```jsx
[ROLES.CLIENTE]: [
  { path: '/dashboard', name: 'Mi Panel' },
  { path: '/perfil', name: 'Mi Perfil' },
  { path: '/mis-motos', name: 'Mis Motos' },
  { path: '/mis-mantenimientos', name: 'Mis Mantenimientos' },
  { path: '/mis-compras', name: 'Mis Compras' },
  { path: '/catalogo', name: 'Catálogo' }
]
```

## 📊 Estadísticas Implementadas

### Mis Motos
- Total de motos registradas
- Motos activas
- Motos en mantenimiento

### Mis Mantenimientos
- Total de mantenimientos
- Mantenimientos pendientes
- Mantenimientos en proceso
- Mantenimientos completados

### Mis Compras
- Total de compras realizadas
- Total gastado (en pesos colombianos)
- Productos comprados (cantidad)
- Fecha de última compra

## 🎨 Utilidades Creadas

### formatters.js
```javascript
// Funciones de formateo disponibles
formatCurrency(amount)     // Formato moneda colombiana
formatNumber(number)       // Separadores de miles
formatDate(date, format)   // Fechas legibles
formatPercentage(value)    // Porcentajes
formatPhone(phone)         // Teléfonos colombianos
formatDocument(document)   // Cédulas con puntos
```

## 🚦 Estados de Carga

Todas las páginas implementan:
- **Loading**: Spinner mientras cargan los datos
- **Empty State**: Mensaje cuando no hay datos
- **Error Handling**: Notificaciones de error con `showNotification`

## 🔄 Flujo de Datos

1. **Autenticación**: Usuario debe tener rol `cliente`
2. **Carga de datos**: APIs filtran automáticamente por cliente
3. **Renderizado**: Componentes muestran solo datos del cliente
4. **Interacciones**: Permisos específicos por acción
5. **Notificaciones**: Feedback visual de todas las acciones

## 🧪 Testing

Para probar el sistema:

1. **Iniciar aplicación**: `npm run dev`
2. **Login**: Usuario con rol `cliente`
3. **Navegar**: Acceder a `/dashboard`
4. **Probar funcionalidades**:
   - Registrar una moto nueva
   - Ver historial de mantenimientos
   - Consultar compras realizadas
   - Editar perfil personal
   - Explorar catálogo de productos

## 📝 Notas Importantes

- **No afecta CRUDs existentes**: Los módulos administrativos siguen funcionando igual
- **Reutilización**: Máximo aprovechamiento de componentes existentes
- **Seguridad**: Filtrado automático y permisos granulares
- **UX**: Interfaz intuitiva y responsive
- **Performance**: Carga eficiente con estados de loading

## 🔮 Posibles Mejoras Futuras

- Implementar sistema de favoritos en catálogo
- Agregar notificaciones push para mantenimientos
- Sistema de calificaciones y reseñas
- Chat de soporte integrado
- Historial de navegación y búsquedas
- Exportar datos a PDF/Excel
- Sistema de recompensas por fidelidad
