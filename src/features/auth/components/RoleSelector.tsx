import { useAuthContext } from "../context/AuthContext";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { Button } from "../../../shared/components/ui/Button";
import { Footer } from "../../../shared/layouts/Footer";
import { Navbar } from "../../../shared/layouts/Navbar";

export const RoleSelector = () => {
  const { user, setActiveRole, logout } = useAuthContext();

  if (!user) return null;

  return (
    <div className="role-selector-gate" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg-color, #0f172a)'
    }}>
      <Navbar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <FormCard title="Selección de Rol de Acceso">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bienvenido, {user.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Tu cuenta tiene múltiples perfiles asociados. Por favor, selecciona con cuál deseas operar en esta sesión:
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gap: '1.5rem', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              marginBottom: '2rem'
            }}>
              {user.roles.map((role) => (
                <div 
                  key={role.id} 
                  onClick={() => setActiveRole(role)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'var(--accent-color, #3b82f6)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: 'var(--text-bright, #fff)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {role.name}
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted, #94a3b8)',
                    lineHeight: '1.5'
                  }}>
                    {role.description}
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--accent-color, #3b82f6)',
                    letterSpacing: '0.05em'
                  }}>
                    ENTRAR COMO {role.name}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '2rem',
              textAlign: 'center'
            }}>
              <Button 
                label="Cerrar Sesión" 
                onClick={logout} 
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)'
                }} 
              />
            </div>
          </FormCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoleSelector;
