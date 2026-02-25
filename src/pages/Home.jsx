import React from "react";
import { useHome } from "../hooks/useHome";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-8">
    <div className="max-w-6xl mx-auto px-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-red-500">JIC</span>
        <span className="ml-2 text-lg">Taller Especializado</span>
      </div>
      <p className="text-sm mb-4">Mantenimiento & Repuestos | Más de 10 años de experiencia</p>
      <div className="flex justify-center space-x-6 text-sm">
        <span>📞 +591 123-4567</span>
        <span>📍 Rurrenabaque, Beni</span>
        <span>🕐 Lun-Sáb 8:00-18:00</span>
      </div>
    </div>
  </footer>
);

const Home = () => {
  const {
    slides,
    current,
    loading,
    error,
    goToPrevious,
    goToNext,
    goToSlide
  } = useHome();

  const bgImage = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section - Más compacto y profesional */}
      <section 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="text-center text-white max-w-4xl px-6">
          <div className="mb-6">
            <h2 className="text-lg font-light text-gray-300 mb-2 tracking-wide">
              Taller Especializado
            </h2>
            <h1 className="text-7xl font-black mb-4 tracking-tight">
              <span className="text-white">J</span>
              <span className="text-red-500">I</span>
              <span className="text-white">C</span>
            </h1>
            <h3 className="text-2xl font-semibold text-red-400 mb-6 uppercase tracking-wider">
              Mantenimiento & Repuestos
            </h3>
          </div>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            <strong>Más de 10 años</strong> brindando confianza y calidad profesional. 
            Repuestos originales y servicio técnico especializado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Ver Catálogo
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
              Contactar
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Productos Destacados - Más limpio y organizado */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Productos Destacados</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Los mejores repuestos para tu motocicleta</p>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">Error al cargar productos</p>
              </div>
            </div>
          )}

          {!loading && !error && slides.length > 0 && (
            <div className="relative">
              {/* Carousel */}
              <div className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${current * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0">
                      <div className="grid md:grid-cols-2 gap-8 p-8 items-center">
                        {/* Imagen */}
                        <div className="order-2 md:order-1">
                          <div className="relative group">
                            <img
                              src={slide.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'}
                              alt={slide.title}
                              className="w-full h-80 object-contain rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 bg-gray-100 dark:bg-gray-700"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop';
                              }}
                            />
                            {slide.destacado && (
                              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Contenido */}
                        <div className="order-1 md:order-2">
                          <div className="mb-2">
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                              {slide.category || 'Producto'}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {slide.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {slide.description || 'Producto de alta calidad para motocicletas, diseñado para brindar el mejor rendimiento y durabilidad.'}
                          </p>
                          
                          <div className="flex items-center gap-4 mb-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              slide.stock > 0 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              Stock: {slide.stock || 0}
                            </span>
                            {slide.price && (
                              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {slide.price}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-4">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver detalles
                            </button>
                            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                              Contactar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              {/* Indicadores */}
              {slides.length > 0 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === current ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Servicios - Sección nueva y más profesional */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nuestros Servicios</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Experiencia y calidad garantizada</p>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚙️",
                title: "Mantenimiento",
                description: "Servicio completo de mantenimiento preventivo y correctivo para todo tipo de motocicletas."
              },
              {
                icon: "🔧",
                title: "Reparaciones",
                description: "Diagnóstico y reparación especializada con tecnología moderna y repuestos originales."
              },
              {
                icon: "📦",
                title: "Repuestos",
                description: "Amplio catálogo de repuestos originales y compatibles para todas las marcas."
              }
            ].map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos - Más compacto */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trabajos Realizados</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Ver para creer - <span className="text-red-500 font-semibold">Calidad en acción</span>
            </p>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "https://www.youtube.com/embed/cb2Ne6GCItM",
              "https://www.youtube.com/embed/brxGW3nOsHI",
              "https://www.youtube.com/embed/xUVwQJ7WRKw",
              "https://www.youtube.com/embed/dQw4w9WgXcQ"
            ].slice(0, 4).map((src, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={src}
                    title={`Video ${index + 1}`}
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas nuestros servicios?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Contáctanos para una cotización personalizada o visítanos en nuestro taller
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Solicitar Cotización
            </button>
            <button className="border-2 border-gray-500 text-gray-300 hover:border-white hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Ver Ubicación
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;