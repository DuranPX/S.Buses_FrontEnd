// ================================================================
// ADAPTER MOCK — Sistema de Buses
// Utilidades para simular latencia de API y generar UUIDs simples.
// ================================================================

/**
 * Devuelve los datos después de un delay simulado (por defecto 400ms).
 * Úsalo en todos los fake services para imitar una llamada HTTP real.
 *
 * @example
 * const routes = await withDelay(MOCK_ROUTES);
 */
export const withDelay = <T>(data: T, ms = 400): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

/**
 * Genera un UUID v4 simple para los IDs de entidades mock.
 */
export const mockUUID = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

/**
 * Simula un error de API con probabilidad configurable.
 * Útil para probar estados de error en la UI.
 *
 * @example
 * await maybeThrow(0.1); // 10% de probabilidad de error
 */
export const maybeThrow = (probability = 0.1): Promise<void> => {
  if (Math.random() < probability) {
    return Promise.reject(new Error('Error simulado de API'));
  }
  return Promise.resolve();
};
