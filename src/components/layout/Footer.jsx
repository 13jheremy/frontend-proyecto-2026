// src/components/layout/Footer.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';
import logo from '../../assets/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-30 bg-slate-900 dark:bg-slate-950 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8"
              />
              <div>
                <h3 className="text-lg font-bold text-blue-400">SERVICIOS Y REPUESTOS</h3>
                <p className="text-xs text-gray-300">Especialistas en motos</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Servicios de mantenimiento, reparación y venta de repuestos para motocicletas.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-blue-400">Servicios</h4>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Mantenimiento preventivo</li>
              <li>• Reparaciones mecánicas</li>
              <li>• Venta de repuestos</li>
              <li>• Diagnóstico técnico</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-blue-400">Contacto</h4>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-400 text-xs" />
                <span>Av. Principal 123, Ciudad</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPhone} className="text-blue-400 text-xs" />
                <span>+591 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-400 text-xs" />
                <span>info@serviciosyrepuestos.com</span>
              </div>
            </div>
          </div>

          {/* Social Media & Hours */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-blue-400">Síguenos</h4>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FontAwesomeIcon icon={faTwitter} className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
              </a>
            </div>
            
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-gray-200">Horarios</h5>
              <div className="text-xs text-gray-300 space-y-0.5">
                <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
                <p>Sáb: 8:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-400">
                © {currentYear} Servicios y Repuestos - v1.0.0
              </p>
            </div>

            {/* Made with love */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span>Hecho con</span>
              <FontAwesomeIcon icon={faHeart} className="text-red-500 animate-pulse text-xs" />
              <span>en Bolivia</span>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-4 text-xs text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
