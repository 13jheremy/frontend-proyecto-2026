# Taller de Motos - Frontend

Sistema completo de gestión para taller de motocicletas desarrollado en React con Vite, TailwindCSS y integración completa con Django REST Framework.

## 🚀 Características Principales

### ✅ Sistema de Autenticación Completo
- Login/Logout con JWT tokens
- Refresh automático de tokens
- Protección de rutas por roles
- Middleware de autenticación

### ✅ Control de Acceso por Roles
- **Administrador**: Control total del sistema
- **Empleado**: Gestión operativa diaria
- **Técnico**: Especializado en mantenimientos
- **Cliente**: Acceso a información personal

### ✅ 13 Módulos CRUD Completos

#### 🔐 Módulo de Usuario y Seguridad
- **Gestión de Usuarios** (`/usuarios`)
- **Gestión de Roles** (`/roles`)

#### 👥 Módulo de Clientes y Proveedores
- **Gestión de Clientes** (`/clientes`)
- **Gestión de Proveedores** (`/proveedores`)

#### 📦 Módulo de Productos y Servicios
- **Gestión de Productos** (`/productos`)
- **Gestión de Servicios** (`/servicios`)
- **Gestión de Categorías** (`/categorias`)

#### 🏍️ Módulo de Mantenimientos y Vehículos
- **Gestión de Motocicletas** (`/motos`)
- **Gestión de Mantenimientos** (`/mantenimientos`)

#### 💰 Módulo de Ventas e Inventario
- **Punto de Venta** (`/ventas`)
- **Movimientos de Inventario** (`/inventario`)
- **Reportes y Estadísticas** (`/reportes`)

### ✅ Frontend Público
- **Página de Inicio** - Landing page profesional
- **Catálogo de Productos** - Navegación pública de productos
- **Información de Contacto**

### ✅ Dashboards Especializados
- **Dashboard Administrativo** - Para admin y empleados
- **Dashboard de Cliente** - Panel personalizado para clientes

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconografía
- **JWT Decode** - Manejo de tokens

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                    # Componentes reutilizables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Alert.jsx
│   └── layout/                # Componentes de layout
│       ├── MainLayout.jsx
│       ├── Sidebar.jsx
│       └── NavbarPublic.jsx
├── context/
│   └── AuthContext.jsx       # Contexto de autenticación
├── guards/
│   ├── AuthGuard.jsx         # Protección de rutas
│   └── RoleGuard.jsx         # Control por roles
├── hooks/
│   └── useAuth.js            # Hook de autenticación
├── modulos/                  # Módulos CRUD
│   ├── usuarios/
│   ├── roles/
│   ├── clientes/
│   ├── productos/
│   ├── servicios/
│   ├── proveedores/
│   ├── categorias/
│   ├── motos/
│   ├── mantenimiento/
│   ├── ventas/
│   ├── inventario/
│   └── reportes/
├── pages/                    # Páginas principales
│   ├── PublicHome.jsx
│   ├── PublicCatalog.jsx
│   ├── ClientDashboard.jsx
│   └── Dashboard.jsx
├── routes/
│   ├── PrivateRoutes.jsx     # Rutas protegidas
│   └── PublicRoutes.jsx      # Rutas públicas
├── services/
│   ├── api.js                # Configuración de API
│   └── apiServices.js        # Servicios específicos
└── utils/
    ├── constants.js          # Constantes del sistema
    └── rolePermissions.js    # Lógica de permisos
```

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: Azul (#2563eb)
- **Secundario**: Gris (#6b7280)
- **Éxito**: Verde (#10b981)
- **Peligro**: Rojo (#ef4444)
- **Advertencia**: Amarillo (#f59e0b)

### Componentes UI Reutilizables
- **Button**: 7 variantes (primary, secondary, success, danger, warning, outline, ghost)
- **Input**: Con validación y iconos
- **Select**: Dropdown personalizado
- **Modal**: Sistema de modales responsive
- **Table**: Tablas con paginación y acciones
- **Card**: Contenedores flexibles
- **Badge**: Etiquetas de estado
- **Alert**: Sistema de alertas

## 🔒 Sistema de Permisos

### Roles y Accesos

#### 👨‍💼 Administrador
- Control total del sistema
- Gestión de usuarios y roles
- Acceso a todos los módulos
- Configuración maestra

#### 👩‍💼 Empleado
- Gestión de clientes y proveedores
- Ventas y facturación
- Control de inventario
- Reportes operativos

#### 👨‍🔧 Técnico
- Gestión de motocicletas
- Mantenimientos y diagnósticos
- Consulta de productos y servicios
- Movimientos de inventario

#### 🚶‍♂️ Cliente
- Dashboard personalizado
- Historial de mantenimientos
- Mis motocicletas
- Catálogo público

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Taller de Motos
```

## 📱 Responsive Design

El sistema está completamente optimizado para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

### Características Responsive
- Sidebar colapsable en móviles
- Tablas con scroll horizontal
- Formularios adaptables
- Navegación touch-friendly

## 🔧 Configuración de API

### Endpoints Principales
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    ME: '/usuarios/me/',
    
    // Módulos principales
    USERS: '/usuarios/',
    ROLES: '/roles/',
    PERSONS: '/personas/',
    PRODUCTS: '/productos/',
    SERVICES: '/servicios/',
    SUPPLIERS: '/proveedores/',
    CATEGORIES: '/categorias/',
    MOTORCYCLES: '/motos/',
    MAINTENANCE: '/mantenimientos/',
    SALES: '/ventas/',
    INVENTORY: '/inventario-movimientos/',
    
    // Públicos
    PUBLIC_PRODUCTS: '/publico/',
    FEATURED: '/publico/destacados/'
  }
};
```

## 🎯 Funcionalidades Destacadas

### Sistema de Notificaciones
- Toast notifications con React Hot Toast
- Feedback inmediato de acciones
- Estados de carga y error

### Gestión de Estado
- Context API para autenticación
- Estado local para formularios
- Persistencia en localStorage

### Validación de Formularios
- Validación en tiempo real
- Mensajes de error específicos
- Prevención de envíos duplicados

### Búsqueda y Filtrado
- Búsqueda en tiempo real
- Filtros por categoría
- Ordenamiento múltiple

## 🧪 Testing y Calidad

### Buenas Prácticas Implementadas
- Componentes reutilizables
- Separación de responsabilidades
- Manejo consistente de errores
- Código limpio y documentado

### Optimizaciones
- Lazy loading de componentes
- Memoización donde corresponde
- Optimización de re-renders
- Bundle splitting automático

## 📚 Documentación Adicional

### Guías de Uso
- [Gestión de Usuarios](docs/usuarios.md)
- [Sistema de Roles](docs/roles.md)
- [Módulo de Ventas](docs/ventas.md)
- [Inventario](docs/inventario.md)

### API Reference
- [Endpoints](docs/api.md)
- [Autenticación](docs/auth.md)
- [Permisos](docs/permissions.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Desarrollador

Desarrollado con ❤️ para la gestión eficiente de talleres de motocicletas.

---

**¡El sistema está listo para producción!** 🚀

Todas las funcionalidades están implementadas según las especificaciones del backend Django REST Framework, con un diseño moderno, responsive y escalable.
