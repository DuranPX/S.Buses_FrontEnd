import { useAuthorization } from "../../../features/roles/hooks/useAuthorization";
import { AccessDenied } from "../feedback/AccessDenied";
import type { ModuleName } from "../../config/modules";

export const GenericModulePlaceholder = ({ moduleName }: { moduleName: ModuleName }) => {
  const { can, activeRole } = useAuthorization();

  // Route security defense mechanism
  if (!activeRole) return null;
  if (!can(moduleName, 'leer')) return <AccessDenied module={moduleName} />;

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '4rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          💡
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
          Módulo: {moduleName}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
          El módulo de <strong>{moduleName}</strong> está actualmente bajo construcción y será enlazado a sus APIs de backend dinámicas próximamente.
        </p>
        
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {can(moduleName, 'escribir') && (
            <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              Permiso Escritura
            </span>
          )}
          {can(moduleName, 'editar') && (
            <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              Permiso Edición
            </span>
          )}
          {can(moduleName, 'eliminar') && (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
              Permiso Eliminación
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
