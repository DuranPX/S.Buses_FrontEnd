import { useEffect, useState } from 'react';
import { businessApi } from '../../../../api/api';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface Persona {
  id: string;
  firstName: string;
  lastName: string;
}

interface Empresa {
  id: string;
  nombre: string;
}

const CreateDriverModal = ({
  onClose,
  onCreated,
}: Props) => {
  const [personas, setPersonas] = useState<
    Persona[]
  >([]);

  const [empresas, setEmpresas] = useState<
    Empresa[]
  >([]);

  const [personaId, setPersonaId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [licencia, setLicencia] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [personasRes, empresasRes] =
        await Promise.all([
          businessApi.get('/persona'),
          businessApi.get('/empresa'),
        ]);

        console.log(
            'PERSONAS:',
            personasRes.data
        );

      setPersonas(
        Array.isArray(personasRes.data)
            ? personasRes.data
            : personasRes.data.data || []
      );
      setEmpresas(
        Array.isArray(empresasRes.data)
            ? empresasRes.data
            : empresasRes.data.data || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!personaId || !empresaId || !licencia) {
      alert('Completa todos los campos');

      return;
    }

    try {
      setLoading(true);

      await businessApi.post('/conductor', {
        personaId,
        empresaId,
        licencia,
        activo: true,
      });

      onCreated();

      onClose();
    } catch (err) {
      console.error(err);

      alert('Error al crear conductor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#f8fafc' }}>
          Nuevo conductor
        </h2>

        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>
            Persona
          </label>

          <select
            value={personaId}
            onChange={e =>
              setPersonaId(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Seleccionar persona
            </option>

            {Array.isArray(personas) && personas.map(persona => (
              <option
                key={persona.id}
                value={persona.id}
              >
                {persona.firstName}{' '}
                {persona.lastName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>
            Empresa
          </label>

          <select
            value={empresaId}
            onChange={e =>
              setEmpresaId(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Seleccionar empresa
            </option>

            {Array.isArray(empresas) && empresas.map(empresa => (
              <option
                key={empresa.id}
                value={empresa.id}
              >
                {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>
            Licencia
          </label>

          <input
            value={licencia}
            onChange={e =>
              setLicencia(e.target.value)
            }
            style={inputStyle}
            placeholder="Número de licencia"
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <button
            onClick={onClose}
            style={cancelButton}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            style={saveButton}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '500px',
  background: '#0f172a',
  borderRadius: '1rem',
  padding: '2rem',
  border: '1px solid rgba(255,255,255,0.08)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '0.5rem',
  padding: '0.8rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#111827',
  color: '#f8fafc',
};

const labelStyle: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '0.9rem',
};

const cancelButton: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#cbd5e1',
  padding: '0.7rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

const saveButton: React.CSSProperties = {
  background: '#6366f1',
  border: 'none',
  color: 'white',
  padding: '0.7rem 1rem',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

export default CreateDriverModal;