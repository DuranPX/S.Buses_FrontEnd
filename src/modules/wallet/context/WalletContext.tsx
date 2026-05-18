import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { walletService, type BilleteraVirtual } from '../services/walletService';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { syncBusinessUser } from '../../../features/auth/services/auth.service';

interface WalletContextType {
  billeteras: BilleteraVirtual[];
  billeteraPrincipal: BilleteraVirtual | null;
  saldoActual: number;
  isLoadingWallet: boolean;
  errorWallet: string | null;
  recargar: (monto: number) => Promise<BilleteraVirtual>;
  vincularMetodo: (metodoPagoId: string) => Promise<BilleteraVirtual>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [billeteras, setBilleteras] = useState<BilleteraVirtual[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true);
  const [errorWallet, setErrorWallet] = useState<string | null>(null);

  const fetchBilleteras = useCallback(async (ciudadanoId: string) => {
    setIsLoadingWallet(true);
    setErrorWallet(null);
    try {
      const data = await walletService.getBilleterasCiudadano(ciudadanoId);
      setBilleteras(data);
    } catch (err: any) {
      console.warn("No se pudieron cargar las billeteras del ciudadano:", err);
      setErrorWallet(err?.response?.data?.message || "Error al cargar la billetera");
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    if (user?.ciudadanoId) {
      fetchBilleteras(user.ciudadanoId);
    } else if (user?.id) {
      // Fallback si ciudadanoId aún no está en el contexto: sincronizar y buscar
      syncBusinessUser().then(data => {
        const cid = data?.ciudadanoId || user.id;
        fetchBilleteras(cid);
      }).catch(() => {
        fetchBilleteras(user.id);
      });
    } else {
      setBilleteras([]);
      setIsLoadingWallet(false);
    }
  }, [user, fetchBilleteras]);

  const refreshWallet = useCallback(async () => {
    const cid = user?.ciudadanoId || user?.id;
    if (cid) {
      await fetchBilleteras(cid);
    }
  }, [user, fetchBilleteras]);

  const recargar = async (monto: number): Promise<BilleteraVirtual> => {
    const principal = billeteras[0];
    if (!principal) {
      throw new Error("No se encontró una billetera virtual activa para recargar.");
    }
    setIsLoadingWallet(true);
    try {
      const updated = await walletService.recargarSaldo(principal.id, monto);
      setBilleteras(prev => prev.map(b => b.id === updated.id ? updated : b));
      return updated;
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const vincularMetodo = async (metodoPagoId: string): Promise<BilleteraVirtual> => {
    const cid = user?.ciudadanoId || user?.id;
    if (!cid) {
      throw new Error("Usuario no identificado para vincular método de pago.");
    }
    setIsLoadingWallet(true);
    try {
      const nuevaBilletera = await walletService.vincularMetodoPago(cid, metodoPagoId);
      setBilleteras(prev => [...prev, nuevaBilletera]);
      return nuevaBilletera;
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Billetera principal (por defecto la primera del listado)
  const billeteraPrincipal = billeteras.length > 0 ? billeteras[0] : null;
  const saldoActual = billeteraPrincipal ? Number(billeteraPrincipal.saldo || 0) : 0;

  const value = {
    billeteras,
    billeteraPrincipal,
    saldoActual,
    isLoadingWallet,
    errorWallet,
    recargar,
    vincularMetodo,
    refreshWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet debe usarse dentro de WalletProvider");
  }
  return context;
};
