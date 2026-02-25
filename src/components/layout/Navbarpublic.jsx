import {
  faBars,
  faTimes,
  faHome,
  faList,
  faSignInAlt,
  faAddressBook,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";


const Navbarpublic = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const menuItems = [
    { path: "/", label: "Inicio", icon: faHome },
    { path: "/catalogo", label: "Catálogo", icon: faList },
    { path: "/login", label: "Iniciar Sesión", icon: faSignInAlt },
    { path: "/contactos", label: "Contactos", icon: faAddressBook },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ease-in-out
          ${isScrolled 
            ? 'backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-xl border-b border-red-200/30 dark:border-slate-700/50 py-2' 
            : 'backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/30 py-3 md:py-4'
          }
        `}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center group">
            <NavLink
              to="/"
              className="relative font-bold tracking-wide transition-all duration-300 group-hover:scale-105 bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-red-400 dark:via-red-500 dark:to-red-600 bg-clip-text text-transparent"
              style={{
                fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
              }}
            >
              <span className={`${isScrolled ? 'text-xl md:text-3xl' : 'text-2xl md:text-4xl'}`}>
                JIC
              </span>
              <span className={`ml-2 ${isScrolled ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`}>
                TALLER ESPECIALIZADO
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </NavLink>
          </div>

          <button
            onClick={toggleMenu}
            className={`md:hidden relative p-3 rounded-xl backdrop-blur-sm border border-red-200/30 dark:border-slate-700/50 
              bg-white/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-slate-700 
              transition-all duration-300 shadow-lg hover:shadow-xl group
              ${isMenuOpen ? 'bg-red-100 dark:bg-slate-700' : ''}
            `}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon 
              icon={isMenuOpen ? faTimes : faBars} 
              className={`text-lg transition-all duration-300
                ${isMenuOpen 
                  ? 'text-red-600 dark:text-red-400 rotate-90' 
                  : 'text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400'
                }
              `}
            />
          </button>

          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item, i) => (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) => 
                  `relative group px-4 py-2 rounded-xl font-semibold transition-all duration-300 
                   flex items-center space-x-2 hover:scale-105
                   ${isActive 
                     ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                     : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800/50'
                   }
                  `
                }
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-sm transition-all duration-300 group-hover:scale-110"
                />
                <span>{item.label}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </NavLink>
            ))}

            <button
              onClick={toggleDarkMode}
              className={`ml-4 relative flex items-center space-x-3 px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 group overflow-hidden
                ${darkMode 
                  ? 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/80' 
                  : 'bg-white/80 border-red-200/30 hover:bg-red-50/80'
                }
                shadow-lg hover:shadow-xl hover:scale-105
              `}
            >
              <div className={`absolute inset-0 transition-all duration-500 transform
                ${darkMode 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 translate-x-0' 
                  : 'bg-gradient-to-r from-red-400 to-red-500 -translate-x-full group-hover:translate-x-0'
                }
              `}></div>
              
              <FontAwesomeIcon
                icon={darkMode ? faSun : faMoon}
                className={`relative z-10 text-lg transition-all duration-300 group-hover:rotate-12
                  ${darkMode ? 'text-yellow-400' : 'text-slate-600 group-hover:text-white'}
                `}
              />
              <span className={`relative z-10 text-sm font-semibold transition-all duration-300
                ${darkMode ? 'text-slate-300' : 'text-slate-700 group-hover:text-white'}
              `}>
                {darkMode ? "Día" : "Noche"}
              </span>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden absolute top-full left-0 w-full transition-all duration-500 ease-in-out overflow-hidden
            ${isMenuOpen 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
            }
          `}
        >
          <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border-t border-red-200/30 dark:border-slate-700/50">
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-2">
                {menuItems.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    className={({ isActive }) => 
                      `block relative group px-4 py-4 rounded-xl font-semibold transition-all duration-300 
                       flex items-center space-x-3 hover:scale-105 transform
                       ${isActive 
                         ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                         : 'text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800'
                       }
                      `
                    }
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animation: isMenuOpen ? 'slideInFromTop 0.3s ease-out forwards' : ''
                    }}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="text-lg transition-all duration-300 group-hover:scale-110"
                    />
                    <span className="text-lg">{item.label}</span>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300
                        ${isMenuOpen ? 'bg-red-400 scale-100' : 'bg-transparent scale-0'}
                      `}></div>
                    </div>
                  </NavLink>
                ))}

                <div className="pt-4 mt-4 border-t border-red-200/30 dark:border-slate-700/30">
                  <button
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl backdrop-blur-sm border transition-all duration-300 group
                      ${darkMode 
                        ? 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-700/80' 
                        : 'bg-white/80 border-red-200/30 hover:bg-red-50/80'
                      }
                      shadow-lg hover:shadow-xl hover:scale-105
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={darkMode ? faSun : faMoon}
                        className={`text-xl transition-all duration-300 group-hover:rotate-12
                          ${darkMode ? 'text-yellow-400' : 'text-slate-600'}
                        `}
                      />
                      <span className={`text-lg font-semibold
                        ${darkMode ? 'text-slate-300' : 'text-slate-700'}
                      `}>
                        {darkMode ? "Cambiar a modo día" : "Cambiar a modo noche"}
                      </span>
                    </div>
                    
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 relative
                      ${darkMode ? 'bg-red-600' : 'bg-slate-300'}
                    `}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform
                        ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}
                      `}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbarpublic;
