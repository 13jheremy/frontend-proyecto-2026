// src/utils/constants.js

// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  EMPLEADO: 'empleado',
  TECNICO: 'tecnico',
  CLIENTE: 'cliente'
};

// IDs de roles (deben coincidir con tu BD)
export const ROLE_IDS = {
  ADMINISTRADOR: 1,
  EMPLEADO: 2,
  TECNICO: 3,
  CLIENTE: 4
};

// Permisos por módulo
export const PERMISSIONS = {
  // Usuarios y roles (empleados con restricciones adicionales)
  USERS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    CREATE: [ROLES.ADMINISTRADOR],
    EDIT: [ROLES.ADMINISTRADOR],
    DELETE: [ROLES.ADMINISTRADOR],
    RESTORE: [ROLES.ADMINISTRADOR],
    HARD_DELETE: [ROLES.ADMINISTRADOR],
    ACTIVATE: [ROLES.ADMINISTRADOR],
    DEACTIVATE: [ROLES.ADMINISTRADOR]
  },

  // Productos
  PRODUCTS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    VIEW_MAINTENANCE_PARTS: [ROLES.TECNICO]
  },

  // Servicios
  SERVICES: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO, ROLES.CLIENTE],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR],
    VIEW_PRICES: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    VIEW_MAINTENANCE_SERVICES: [ROLES.TECNICO]
  },

  // Ventas
  SALES: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.CLIENTE],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    PAYMENTS: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    VIEW_OWN: [ROLES.CLIENTE]
  },

  // Pagos
  PAYMENTS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.CLIENTE],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR],
    VIEW_OWN: [ROLES.CLIENTE]
  },

  // Mantenimientos
  MAINTENANCE: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO, ROLES.CLIENTE],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    DELETE: [ROLES.ADMINISTRADOR],
    ASSIGN: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    VIEW_OWN: [ROLES.CLIENTE],
    CHANGE_STATUS: [ROLES.TECNICO],
    ADD_OBSERVATIONS: [ROLES.TECNICO]
  },

  // Inventario
  INVENTORY: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    MOVEMENTS: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    VIEW_MAINTENANCE_PARTS: [ROLES.TECNICO]
  },

  // Proveedores
  SUPPLIERS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO]
  },

  // Clientes/Personas
  CUSTOMERS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR],
    VIEW_OWN: [ROLES.CLIENTE],
    VIEW_BASIC_MAINTENANCE_RELATED: [ROLES.TECNICO]
  },

  // Motos
  MOTOS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR],
    VIEW_MAINTENANCE_RELATED: [ROLES.TECNICO]
  },

  // Recordatorios
  RECORDATORIOS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    CREATE: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    EDIT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DELETE: [ROLES.ADMINISTRADOR],
    TOGGLE_ACTIVO: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    MARCAR_COMPLETADO: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO, ROLES.TECNICO],
    VIEW_OWN: [ROLES.CLIENTE]
  },

  // Reportes y dashboard
  REPORTS: {
    VIEW: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    DASHBOARD_STATS: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO],
    SALES_REPORT: [ROLES.ADMINISTRADOR, ROLES.EMPLEADO]
  }
};

// Rutas por rol
export const ROLE_ROUTES = {
  [ROLES.ADMINISTRADOR]: [
    { path: '/', name: 'Dashboard' },
    { path: '/usuarios', name: 'Usuarios' },
    { path: '/productos', name: 'Productos' },
    { path: '/servicios', name: 'Servicios' },
    { path: '/proveedores', name: 'Proveedores' },
    { path: '/ventas', name: 'Ventas' },
    { path: '/motos', name: 'Motos' },
    { path: '/categorias', name: 'Categorias' },
    { path: '/mantenimiento', name: 'Mantenimientos' },
    { path: '/recordatorios', name: 'Recordatorios' },
    { path: '/inventario', name: 'Inventario' },
    { path: '/movimientos', name: 'Movimientos' },
    { path: '/reportes', name: 'Reportes' },
    { path: '/business-intelligence', name: 'Business Intelligence' },
  ],
  [ROLES.EMPLEADO]: [
    { path: '/', name: 'Dashboard' },
    { path: '/usuarios', name: 'Clientes' },
    { path: '/productos', name: 'Productos' },
    { path: '/servicios', name: 'Servicios' },
    { path: '/proveedores', name: 'Proveedores' },
    { path: '/ventas', name: 'Ventas' },
    { path: '/motos', name: 'Motos' },
    { path: '/mantenimiento', name: 'Mantenimientos' },
    { path: '/recordatorios', name: 'Recordatorios' },
    { path: '/inventario', name: 'Inventario' },
    { path: '/movimientos', name: 'Movimientos' },
    { path: '/business-intelligence', name: 'Business Intelligence' },
  ],
  [ROLES.TECNICO]: [
    { path: '/', name: 'Dashboard' },
    { path: '/mantenimientos', name: 'Mis Mantenimientos' },
    { path: '/servicios', name: 'Servicios' },
    { path: '/inventario', name: 'Inventario' },
    { path: '/movimientos', name: 'Movimientos' },
    { path: '/pos', name: 'POS' },
    { path: '/pos/nuevo-mantenimiento-pos', name: 'Nuevo Mantenimiento POS' }
  ],
  [ROLES.CLIENTE]: [
    { path: '/dashboard', name: 'Mi Panel' },
    { path: '/perfil', name: 'Mi Perfil' },
    { path: '/mis-motos', name: 'Mis Motos' },
    { path: '/mis-mantenimientos', name: 'Mis Mantenimientos' },
    { path: '/mis-compras', name: 'Mis Compras' }
  ]
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/',
  ENDPOINTS: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    ME: '/me/',
    CHANGE_PASSWORD: 'me/cambiar-password/',
    LOGOUT: '/auth/logout/',
    
    // Password Reset Endpoints
    PASSWORD_RESET_REQUEST: '/password-reset/',
    PASSWORD_RESET_CONFIRM: '/password-reset-confirm/',
    
    // Endpoints principales
    USERS: '/usuarios/',
    ROLES: '/roles/',
    PERSONS: '/personas/',
    //PRODUCTOS
    PRODUCTS: '/productos/',

    
    SERVICES: '/servicios/',
    SUPPLIERS: '/proveedores/',
    CATEGORIES: '/categorias/',
    SERVICE_CATEGORIES: '/categorias-servicio/',
    MOTORCYCLES: '/motos/',
    MAINTENANCE: '/mantenimientos/',
    SALES: '/ventas/',
    DETAILSALES: '/detalles-venta/',
    PAYMENTS: '/pagos/',
    INVENTORY: '/inventario/',
    INVENTORYMOVEMENT: '/inventario-movimientos/',
    MAINTENANCEREMINDER: '/recordatorios/',
    
    //endpoints usuarios
    CREATECOMPLETE: '/usuarios/crear_completo/',
    GETCOMPLETE:'/usuarios/complete/',
    
    // Endpoints públicos
    PUBLIC_PRODUCTS: '/publico/',
    CATEGORIESPUBLIC: '/publico/categorias/',
    FEATURED: '/publico/destacados/',
    
    // Dashboard y reportes
    DASHBOARD_STATS: '/dashboard/stats/', // Dashboard específico para clientes
    CLIENT_DASHBOARD_STATS: '/cliente/dashboard/stats/',
    TECHNICIAN_DASHBOARD_STATS: '/tecnico/dashboard/stats/',
    
    // Business Intelligence endpoints
    BI_ANALYTICS_ADVANCED: '/bi/analytics/advanced/',
    BI_DEMAND_FORECAST: '/bi/forecasting/demand/',
    BI_PROFITABILITY_ANALYSIS: '/bi/profitability/',
    BI_TECHNICIAN_PERFORMANCE: '/bi/performance/technicians/',
    BI_CUSTOMER_SEGMENTATION: '/bi/customers/segmentation/',
    BI_TREND_ANALYSIS: '/bi/trends/',
    BI_CUSTOM_KPIS: '/bi/kpis/custom/',
  
    // Endpoints específicos para clientes
    CLIENT_MOTOS: '/cliente/motos/',
    CLIENT_VENTAS: '/cliente/ventas/',
    CLIENT_MANTENIMIENTOS: '/cliente/mantenimientos/',
    SALES_REPORT: '/reporte-ventas/',
    HEALTH_CHECK: '/health-check/',
    
    // POS Endpoints
    POS_CREAR_VENTA: '/pos/ventas/crear/',
    POS_PROCESAR_VENTA: '/pos/ventas/crear/',
    POS_BUSCAR_PRODUCTOS: '/pos/productos/buscar/',
    POS_BUSCAR_CLIENTES: '/pos/clientes/buscar/',
    POS_BUSCAR_TECNICOS: '/pos/tecnicos/buscar/',
    POS_BUSCAR_MOTOS: '/pos/motos/buscar/',
    POS_BUSCAR_SERVICIOS: '/pos/servicios/buscar/',
    POS_CREAR_MANTENIMIENTO: '/pos/mantenimientos/crear/',
    POS_ALERTAS_INVENTARIO: '/pos/inventario/alertas/',
    POS_AJUSTAR_INVENTARIO: '/pos/inventario/ajustar/',
    POS_DASHBOARD_STATS: '/pos/dashboard/stats/',

    // Recordatorios endpoints
    RECORDATORIOS: '/recordatorios/',
  }
};

// Estados de mantenimiento
export const MAINTENANCE_STATES = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_proceso', 
  COMPLETED: 'completado',
  CANCELLED: 'cancelado'
};

// Tipos de movimiento de inventario
export const INVENTORY_MOVEMENT_TYPES = {
  INPUT: 'entrada',
  OUTPUT: 'salida',
  ADJUSTMENT: 'ajuste'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Mensajes del sistema
export const MESSAGES = {
  LOGIN: {
    SUCCESS: 'Inicio de sesión exitoso',
    ERROR: 'Usuario o contraseña incorrectos',
    INVALID_EMAIL: 'El formato del correo electrónico no es válido',
    REQUIRED_FIELDS: 'Todos los campos son obligatorios',
    INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
    ACCOUNT_DISABLED: 'Cuenta desactivada o sin permisos',
    SERVER_ERROR: 'Error del servidor. Intente más tarde',
    CONNECTION_ERROR: 'No se pudo conectar con el servidor'
  },
  PERMISSIONS: {
    DENIED: 'No tienes permisos para realizar esta acción',
    INSUFFICIENT: 'Permisos insuficientes'
  },
  API: {
    ERROR: 'Error en el servidor',
    NETWORK_ERROR: 'Error de conexión',
    TIMEOUT: 'Tiempo de espera agotado'
  }
};

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 10,
};

export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const MODAL_TYPES = {
  SIMPLE: 'simple',
  COMPLETE: 'complete',
  EDIT: 'edit',
};

// Estados de ventas
export const SALE_STATES = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
  ANULADA: 'ANULADA'
};

// Métodos de pago
export const PAYMENT_METHODS = {
  EFECTIVO: 'EFECTIVO',
  TARJETA: 'TARJETA',
  TRANSFERENCIA: 'TRANSFERENCIA',
  OTRO: 'OTRO'
};

// Colores para estados de pago
export const PAYMENT_STATUS_COLORS = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PAGADA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ANULADA: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

// Colores para métodos de pago
export const PAYMENT_METHOD_COLORS = {
  EFECTIVO: 'bg-green-100 text-green-800',
  TARJETA: 'bg-blue-100 text-blue-800',
  TRANSFERENCIA: 'bg-purple-100 text-purple-800',
  OTRO: 'bg-gray-100 text-gray-800'
};

export const VALIDATION_RULES = {
  username: {
    required: true,
    minLength: 3,
  },
  email: {
    required: true,
    pattern: /\S+@\S+\.\S+/,
  },
  password: {
    minLength: 8,
  },
};
