import { useEffect, useState } from 'react';
import { Loader } from '../../../../shared/components/ui/Loader';
import { businessApi } from '../../../../api/api';

import DriverTable from '../components/DriverTable';
import DriverEmptyState from '../components/DriverEmptyState';
import CreateDriverModal from '../components/CreateDriverModal';

export interface Driver {
  id: string;
  licencia: string;
  activo: boolean;

  persona?: {
    firstName: string;
    lastName: string;
    email?: string;
  };

  empresas?: {
    id: string;
    nombre: string;
  }[];
}

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);

      const response = await businessApi.get('/conductor');

      console.log(response.data);

      setDrivers(
        Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      );
    } catch (err) {
      console.error(err);

      setError(
        'Error al cargar la lista de conductores.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <>
      <div
        style={{
          padding: '1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#f8fafc',
              }}
            >
              Gestión de Conductores
            </h1>

            <p
              style={{
                color: '#94a3b8',
                margin: 0,
              }}
            >
              Administración de conductores y turnos.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#6366f1',
              color: 'white',
              padding: '0.7rem 1.2rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Nuevo conductor
          </button>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              minHeight: '300px',
            }}
          >
            <Loader />
          </div>
        ) : error ? (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : drivers.length === 0 ? (
          <DriverEmptyState
            onCreate={() => setShowCreateModal(true)}
          />
        ) : (
          <DriverTable
            drivers={drivers}
            onRefresh={fetchDrivers}
          />
        )}
      </div>

      {/* MODALS */}

      {showCreateModal && (
        <CreateDriverModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchDrivers}
        />
      )}
    </>
  );
};

export default AdminDriversPage;