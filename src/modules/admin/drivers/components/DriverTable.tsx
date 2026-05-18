import { businessApi } from '../../../../api/api';
import type { Driver } from '../pages/AdminDriversPage';

interface Props {
  drivers: Driver[];
  onRefresh: () => void;
}

const DriverTable = ({
  drivers,
  onRefresh,
}: Props) => {
  const toggleStatus = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      await businessApi.patch(`/conductor/${id}`, {
        activo: !currentStatus,
      });

      onRefresh();
    } catch (err) {
      console.error(err);

      alert('Error al actualizar conductor');
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderBottom:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <th style={thStyle}>CONDUCTOR</th>
            <th style={thStyle}>LICENCIA</th>
            <th style={thStyle}>EMPRESAS</th>
            <th style={thStyle}>ESTADO</th>
            <th style={thStyle}>ACCIONES</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map(driver => (
            <tr
              key={driver.id}
              style={{
                borderBottom:
                  '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <td style={tdStyle}>
                <div
                  style={{
                    color: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  {driver.persona
                    ? `${driver.persona.firstName} ${driver.persona.lastName}`
                    : 'Sin persona'}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.8rem',
                  }}
                >
                  {driver.persona?.email ||
                    'Sin correo'}
                </div>
              </td>

              <td style={tdStyle}>
                {driver.licencia}
              </td>

              <td style={tdStyle}>
                {driver.empresas?.length
                  ? driver.empresas
                      .map(e => e.nombre)
                      .join(', ')
                  : 'Sin empresa'}
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: driver.activo
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(239,68,68,0.2)',
                    color: driver.activo
                      ? '#10b981'
                      : '#ef4444',
                  }}
                >
                  {driver.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </td>

              <td style={tdStyle}>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                    
                  <button
                    onClick={() =>
                      toggleStatus(
                        driver.id,
                        driver.activo
                      )
                    }
                    style={{
                      ...buttonStyle,
                      background:
                        'rgba(239,68,68,0.15)',
                      color: '#ef4444',
                    }}
                  >
                    {driver.activo
                      ? 'Inactivar'
                      : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  color: '#cbd5e1',
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.45rem 0.8rem',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.8rem',
};

export default DriverTable;