import { apiClient } from './apiClient';

/**
 * Función para obtener la lista de productos destacados desde la API.
 * Realiza una petición GET al endpoint /productos/destacados.
 *
 * @returns {Promise<Array>} Un array de objetos de productos destacados.
 * @throws {Error} Si la petición falla.
 */
export const getDestacados = async () => {
    try {
        // La URL completa del endpoint
        const url = '/productos/destacados/';
        const response = await apiClient.get(url);
        
        // Retorna los datos de la respuesta
        return response.data;
    } catch (error) {
        // Manejo de errores para la petición
        throw error;
    }
};