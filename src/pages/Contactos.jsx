import React from "react";
import bgContactos from "../assets/bg1.jpeg";
import { FaFacebook, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Contactos = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section 
        className="relative py-20 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${bgContactos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="text-center text-white max-w-4xl px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
            <FaEnvelope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta o servicio.
          </p>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Información de Contacto</h2>
            <div className="w-20 h-1 bg-red-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ubicación */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
                <FaMapMarkerAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ubicación</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Av. Principal #123<br/>
                Rurrenabaque, Beni<br/>
                Bolivia
              </p>
            </div>

            {/* Teléfono */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
                <FaPhoneAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Teléfono</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                <a href="tel:+59177777777" className="hover:text-red-600 transition-colors duration-300">
                  +591 77777777
                </a><br/>
                <a href="tel:+59188888888" className="hover:text-red-600 transition-colors duration-300">
                  +591 88888888
                </a>
              </p>
            </div>

            {/* Email */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
                <FaEnvelope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Email</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                <a href="mailto:info@jictaller.com" className="hover:text-red-600 transition-colors duration-300">
                  info@jictaller.com
                </a><br/>
                <a href="mailto:contacto@jictaller.com" className="hover:text-red-600 transition-colors duration-300">
                  contacto@jictaller.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Redes sociales */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Síguenos en Redes Sociales</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Mantente al día con nuestras últimas noticias y promociones</p>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>
          
          <div className="flex justify-center gap-8">
            {/* Facebook */}
            <a 
              href="https://facebook.com/jictaller" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaFacebook className="w-8 h-8 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Facebook</span>
            </a>
            
            {/* Instagram */}
            <a 
              href="https://instagram.com/jictaller" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaInstagram className="w-8 h-8 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Instagram</span>
            </a>
            
            {/* WhatsApp */}
            <a 
              href="https://wa.me/59177777777" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaWhatsapp className="w-8 h-8 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Horarios */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Horarios de Atención</h2>
              <div className="w-20 h-1 bg-red-500 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lunes a Viernes</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">8:00 AM - 6:00 PM</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sábados</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">8:00 AM - 12:00 PM</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-500 dark:text-gray-400 italic">Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre por qué somos la mejor opción para el cuidado de tu motocicleta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/59177777777" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FaWhatsapp className="w-6 h-6" />
              Escribir por WhatsApp
            </a>
            <a 
              href="tel:+59177777777" 
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FaPhoneAlt className="w-5 h-5" />
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contactos;
