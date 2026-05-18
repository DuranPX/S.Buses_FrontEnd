import { businessApi } from '../../../api/api';

export interface MetodoPagoCatalogo {
  id: string;
  tipo: string;
  descripcion: string;
}

export interface BilleteraVirtual {
  id: string;
  saldo: string | number;
  ciudadano?: { id: string };
  metodoPago?: { id: string; tipo: string; descripcion?: string };
  boletos?: any[];
}

export interface MovimientoHistorial {
  id: string;
  tipo: 'RECARGA' | 'VIAJE' | string;
  monto: string | number;
  referencia_externa?: string;
  fecha: string;
  boleto?: { id: string; estado: string } | null;
}

export const walletService = {
  /**
   * 1. Consultar el Saldo y Billeteras del Usuario Actual
   * GET /metodo-pago-ciudadano/ciudadano/{ciudadanoId}
   */
  getBilleterasCiudadano: async (ciudadanoId: string): Promise<BilleteraVirtual[]> => {
    const res = await businessApi.get<BilleteraVirtual[]>(`/metodo-pago-ciudadano/ciudadano/${ciudadanoId}`);
    return res.data;
  },

  /**
   * 2. Recargar Saldo en la Billetera Virtual
   * PATCH /metodo-pago-ciudadano/{id}/recarga
   */
  recargarSaldo: async (billeteraId: string, monto: number): Promise<BilleteraVirtual> => {
    const res = await businessApi.patch<BilleteraVirtual>(`/metodo-pago-ciudadano/${billeteraId}/recarga`, { monto });
    return res.data;
  },

  /**
   * 3. Pagar un Pasaje / Consumir Saldo (Abordaje)
   * POST /boletos/abordaje
   */
  pagarPasaje: async (programacionId: string, paraderoId: string, metodoPagoId: string) => {
    const res = await businessApi.post('/boletos/abordaje', {
      programacionId,
      paraderoId,
      metodoPagoId
    });
    return res.data;
  },

  /**
   * 4. Consultar Catálogo de Métodos de Pago Disponibles (Para afiliar una nueva opción)
   * GET /metodo-pago
   */
  getCatalogoMetodosPago: async (): Promise<MetodoPagoCatalogo[]> => {
    const res = await businessApi.get<MetodoPagoCatalogo[]>('/metodo-pago');
    return res.data;
  },

  /**
   * 5. Vincular/Afiliar un Nuevo Método de Pago al Usuario
   * POST /metodo-pago-ciudadano
   */
  vincularMetodoPago: async (ciudadanoId: string, metodoPagoId: string): Promise<BilleteraVirtual> => {
    const res = await businessApi.post<BilleteraVirtual>('/metodo-pago-ciudadano', {
      ciudadanoId,
      metodoPagoId
    });
    return res.data;
  },

  /**
   * 6. Consultar Historial de Movimientos (Viajes y Recargas)
   * GET /historial
   */
  getHistorialGeneral: async (): Promise<MovimientoHistorial[]> => {
    const res = await businessApi.get<MovimientoHistorial[]>('/historial');
    return res.data;
  },

  /**
   * Consultar Historial Solo Viajes
   * GET /historial/viajes
   */
  getHistorialViajes: async (): Promise<MovimientoHistorial[]> => {
    const res = await businessApi.get<MovimientoHistorial[]>('/historial/viajes');
    return res.data;
  }
};
