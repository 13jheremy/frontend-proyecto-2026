// src/modulos/productos/pages/components/ImportProductsModal.jsx
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileCsv, faDownload, faTimes, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { leerArchivoCSV, validarProductosImportacion, convertirParaAPI, descargarPlantillaCSV } from '../utils/importUtils';
import { productoApi } from '../api/producto';

const ImportProductsModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Seleccionar archivo, 2: Validar, 3: Importar
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback(async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Por favor seleccione un archivo CSV');
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await leerArchivoCSV(selectedFile);
      setRawData(data);
      
      // Validar los datos
      const validation = validarProductosImportacion(data);
      setValidationResult(validation);
      setStep(2);
    } catch (error) {
      alert(`Error al leer el archivo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!validationResult?.validos?.length) return;

    setImporting(true);
    setStep(3);
    
    const productosAPI = convertirParaAPI(validationResult.validos);
    const resultados = { exitosos: 0, errores: 0, erroresDetalle: [] };

    try {
      for (const producto of productosAPI) {
        try {
          await productoApi.createProducto(producto);
          resultados.exitosos++;
        } catch (err) {
          resultados.errores++;
          resultados.erroresDetalle.push({
            producto: producto.nombre,
            error: err.response?.data?.detail || err.message
          });
        }
      }

      setImportResult(resultados);
      
      if (resultados.exitosos > 0) {
        onSuccess(resultados.exitosos);
      }
    } catch (error) {
      console.error('Error en importación:', error);
      setImportResult({ exitosos: 0, errores: 1, erroresDetalle: [error.message] });
    } finally {
      setImporting(false);
    }
  }, [validationResult, onSuccess]);

  const handleDownloadTemplate = useCallback(() => {
    descargarPlantillaCSV();
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setFile(null);
    setRawData([]);
    setValidationResult(null);
    setImportResult(null);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Importar Productos
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {/* Paso 1: Seleccionar archivo */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Instrucciones:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• El archivo debe estar en formato CSV</li>
                    <li>• Debe contener los encabezados requeridos</li>
                    <li>• Los precios deben ser números positivos</li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Descargar Plantilla
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FontAwesomeIcon icon={faFileCsv} className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Seleccione un archivo CSV con los productos
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Paso 2: Validar datos */}
            {step === 2 && validationResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Resultados de Validación</h4>
                  <button
                    onClick={handleReset}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cambiar archivo
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        {validationResult.validos.length} válidos
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                      <span className="text-red-800 dark:text-red-200 font-medium">
                        {validationResult.errores.length} errores
                      </span>
                    </div>
                  </div>
                </div>

                {validationResult.errores.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Errores encontrados:</h5>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      {validationResult.errores.map((err, idx) => (
                        <li key={idx}>
                          <strong>Fila {err.fila}:</strong> {err.errors.join(', ')}
                          {err.producto?.nombre && <span className="ml-1">({err.producto.nombre})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.validos.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Productos a importar:</h5>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-1">Código</th>
                            <th className="pb-1">Nombre</th>
                            <th className="pb-1">Categoría</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.validos.slice(0, 5).map((p, idx) => (
                            <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                              <td className="py-1 pr-2">{p.codigo}</td>
                              <td className="py-1 pr-2">{p.nombre}</td>
                              <td className="py-1">{p.categoria}</td>
                            </tr>
                          ))}
                          {validationResult.validos.length > 5 && (
                            <tr>
                              <td colSpan="3" className="py-1 text-gray-500">
                                ...y {validationResult.validos.length - 5} más
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Importando */}
            {step === 3 && (
              <div className="space-y-4">
                {importing ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Importando productos...</p>
                  </div>
                ) : importResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-2xl mb-2" />
                        <p className="text-green-800 dark:text-green-200 font-medium">
                          {importResult.exitosos} importados
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl mb-2" />
                        <p className="text-red-800 dark:text-red-200 font-medium">
                          {importResult.errores} errores
                        </p>
                      </div>
                    </div>

                    {importResult.erroresDetalle.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Detalles de errores:</h5>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                          {importResult.erroresDetalle.map((err, idx) => (
                            <li key={idx}>
                              <strong>{err.producto}:</strong> {err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
            {step === 2 && validationResult?.validos?.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importando...' : 'Importar Productos'}
              </button>
            )}
            {step === 3 && importResult && (
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;
