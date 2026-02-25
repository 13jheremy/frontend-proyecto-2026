// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_ROUTES } from '../../utils/constants';
import { useSidebar } from './MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../../assets/logo.svg';
import { 
  faBars, 
  faTimes, 
  faUser, 
  faCog, 
  faSignOutAlt, 
  faSun,
  faMoon,
  faChevronLeft,
  faChevronRight,
  faHome,
  faUsers,
  faBox,
  faTruck,
  faTools,
  faShoppingCart,
  faMotorcycle,
  faWrench,
  faWarehouse,
  faExchangeAlt,
  faChartBar,
  faTags,
  faUserFriends,
  faClipboardList,
  faSearch,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, primaryRole, getUserFullName, getUserInitials, logout } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const availableRoutes = ROLE_ROUTES[primaryRole] || [];
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on component mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isCurrentRoute = (path) => location.pathname === path;

  // Mapeo de iconos para las rutas
  const getRouteIcon = (routeName) => {
    const iconMap = {
      'Dashboard': faHome,
      'Usuarios': faUsers,
      'Productos': faBox,
      'Proveedores': faTruck,
      'Servicios': faTools,
      'Ventas': faShoppingCart,
      'Motos': faMotorcycle,
      'Mantenimientos': faWrench,
      'Mantenimiento': faWrench,
      'Mis Mantenimientos': faWrench,
      'Inventario': faWarehouse,
      'Movimientos': faExchangeAlt,
      'Reportes': faChartBar,
      'Business Intelligence': faChartLine,
      'Categorias': faTags,
      'Clientes': faUserFriends,
      'Mi Panel': faHome,
      'Mi Perfil': faUser,
      'Mis Motos': faMotorcycle,
      'Mis Mantenimientos': faWrench,
      'Mis Compras': faShoppingCart,
      'Catálogo': faSearch
    };
    return iconMap[routeName] || faHome;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={isMobileOpen ? faTimes : faBars} className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-all duration-200 flex flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex flex-col items-center justify-center w-full">
              <img
                src={logo}
                alt="Logo"
                className="w-12 h-12 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                repuestos y servicios
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <FontAwesomeIcon 
                icon={isDarkMode ? faSun : faMoon} 
                className="w-5 h-5" 
              />
            </button>
            
            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FontAwesomeIcon 
                icon={isCollapsed ? faChevronRight : faChevronLeft} 
                className="w-4 h-4" 
              />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                {getUserInitials()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getUserFullName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.correo_electronico}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                    {primaryRole}
                  </span>
                </div>
              )}
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className={`absolute ${isCollapsed ? 'left-16' : 'left-0'} top-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50`}>
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserFullName()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.correo_electronico}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/perfil"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    <span>Mi Perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto overscroll-contain">
          <div className="space-y-2">
            {availableRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isCurrentRoute(route.path)
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? route.name : ''}
                onClick={() => setIsMobileOpen(false)}
              >
                <FontAwesomeIcon 
                  icon={getRouteIcon(route.name)} 
                  className={`w-5 h-5 ${isCurrentRoute(route.path) ? 'text-blue-600 dark:text-blue-400' : ''}`} 
                />
                {!isCollapsed && (
                  <span className="text-sm">{route.name}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2025 Servicios y Repuestos v1.0.0
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
