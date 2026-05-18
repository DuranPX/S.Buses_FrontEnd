interface Props {
  onCreate: () => void;
}

const DriverEmptyState = ({ onCreate }: Props) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}
        >
          🚌
        </div>

        <h2
          style={{
            color: '#f8fafc',
            marginBottom: '0.5rem',
          }}
        >
          No hay conductores registrados
        </h2>

        <p
          style={{
            color: '#94a3b8',
            marginBottom: '2rem',
          }}
        >
          Comienza creando el primer conductor del
          sistema.
        </p>

        <button
          onClick={onCreate}
          style={{
            background: '#6366f1',
            color: 'white',
            padding: '0.8rem 1.4rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Crear conductor
        </button>
      </div>
    </div>
  );
};

export default DriverEmptyState;