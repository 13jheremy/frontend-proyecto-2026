import { useState, useEffect } from 'react';
import { getDestacados } from '../services/destacadosAPI';

/**
 * Hook personalizado para obtener y gestionar el estado de los productos destacados.
 * Permite la carga, manejo de errores y filtrado de los datos.
 *
 * @returns {{
 * destacados: Array,
 * isLoading: boolean,
 * error: Error | null,
 * searchTerm: string,
 * setSearchTerm: function
 * }} El estado de los productos y funciones para manipularlo.
 */
export const useDestacados = () => {
    // Estado para almacenar los datos originales de la API
    const [destacados, setDestacados] = useState([]);
    // Estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para almacenar los productos filtrados
    const [filteredDestacados, setFilteredDestacados] = useState([]);
    // Estado para el indicador de carga
    const [isLoading, setIsLoading] = useState(true);
    // Estado para manejar errores de la API
    const [error, setError] = useState(null);

    // useEffect para la llamada inicial a la API
    useEffect(() => {
        const fetchDestacados = async () => {
            try {
                const data = await getDestacados();
                setDestacados(data);
                setFilteredDestacados(data); // Inicialmente, los filtrados son todos los datos
                setIsLoading(false);
            } catch (err) {
                setError(err);
                setIsLoading(false);
            }
        };

        fetchDestacados();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    // useEffect para el filtrado, se ejecuta cada vez que cambia el término de búsqueda o los datos
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredDestacados(destacados);
        } else {
            const filtered = destacados.filter(product =>
                // Filtra por ID, nombre o fecha de registro
                product.id.toString().includes(searchTerm.toLowerCase()) ||
                product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                new Date(product.fecha_registro).toLocaleDateString().includes(searchTerm)
            );
            setFilteredDestacados(filtered);
        }
    }, [searchTerm, destacados]);

    return { filteredDestacados, isLoading, error, searchTerm, setSearchTerm };
};