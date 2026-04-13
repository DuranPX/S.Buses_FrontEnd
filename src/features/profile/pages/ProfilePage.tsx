import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { Button } from "../../../shared/components/ui/Button";
import { showAlert } from "../../../shared/utils/alerts";
import { unlinkAuthExternal, getMe } from "../../auth/services/auth.service";
import googleLogo from "../../../assets/images/google_provider.png";
import azureLogo from "../../../assets/images/azure provider.png";
import githubLogo from "../../../assets/images/github_provider.png";

const providerLogos: Record<string, string> = {
  google: googleLogo,
  microsoft: azureLogo,
  github: githubLogo,
};

const providerNames: Record<string, string> = {
  google: "Google",
  microsoft: "Microsoft",
  github: "GitHub",
};

export const ProfilePage = () => {
  const { user, activeRole, updateUser } = useAuth();
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);

  if (!user) return null;

  const handleUnlink = async (provider: string) => {
    const confirmation = await showAlert.warning(
      "¿Desvincular cuenta?",
      `¿Seguro que deseas desvincular tu cuenta de ${providerNames[provider] || provider}? Perderás la posibilidad de iniciar sesión con ese proveedor.`
    );

    if (!confirmation.isConfirmed) return;

    try {
      setUnlinkingProvider(provider);
      const result = await unlinkAuthExternal(user.id, provider);
      
      if (result?.user) {
        // Actualizar el usuario en el contexto global (reactivo en navbar, sidebar, etc.)
        updateUser({
          ...result.user,
          authExternals: result.user.authExternals || []
        });
      } else {
        // Refetch desde el backend para sincronizar
        try {
          const sessionData = await getMe();
          if (sessionData?.user) {
            updateUser(sessionData.user);
          }
        } catch (e) {
          // Fallback local: remover el proveedor del estado
          updateUser({
            authExternals: (user.authExternals || []).filter(a => a.proveedor !== provider)
          });
        }
      }
      
      showAlert.success("Desvinculado", result?.message || `Cuenta de ${providerNames[provider] || provider} desvinculada exitosamente.`);
    } catch (err) {
      // El error ya es manejado por el servicio (showAlert.error)
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const linkedProviders = user.authExternals || [];


  return (
    <div className="profile-page" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Perfil</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Gestiona tu información personal y cuentas vinculadas.</p>

      {/* Información Personal */}
      <FormCard title="Información Personal">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            fontSize: '2.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            {user.photo ? (
              <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user.name || "U")[0].toUpperCase()
            )}
          </div>

          {/* Datos */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minWidth: '300px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{user.name}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Apellido</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{user.lastName || '—'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{user.email}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Teléfono</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{user.phone || '—'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dirección</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{user.address || '—'}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Rol Activo</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--accent-color, #3b82f6)' }}>{activeRole?.name || '—'}</p>
            </div>
          </div>
        </div>
      </FormCard>

      {/* Cuentas Vinculadas */}
      <div style={{ marginTop: '2rem' }}>
        <FormCard title="Cuentas Vinculadas">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Gestiona los proveedores externos con los que puedes iniciar sesión.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['google', 'microsoft', 'github'].map(provider => {
              const linked = linkedProviders.find(a => a.proveedor === provider);
              const isUnlinking = unlinkingProvider === provider;

              return (
                <div key={provider} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.2rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${linked ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={providerLogos[provider]}
                      alt={provider}
                      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {providerNames[provider] || provider}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {linked ? linked.email : 'No vinculada'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {linked ? (
                      <>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#22c55e',
                          background: 'rgba(34,197,94,0.1)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px'
                        }}>
                          VINCULADA
                        </span>
                        <Button
                          label={isUnlinking ? "Desvinculando..." : "Desvincular"}
                          onClick={() => handleUnlink(provider)}
                          disabled={isUnlinking}
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            padding: '0.4rem 0.8rem',
                            opacity: isUnlinking ? 0.5 : 1
                          }}
                        />
                      </>
                    ) : (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px'
                      }}>
                        NO VINCULADA
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </FormCard>
      </div>

      {/* Seguridad */}
      <div style={{ marginTop: '2rem' }}>
        <FormCard title="Seguridad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>Autenticación de Dos Factores</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Se envía un código a tu email en cada inicio de sesión.</div>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#22c55e',
                background: 'rgba(34,197,94,0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px'
              }}>
                ACTIVO
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>Todos tus roles</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Perfiles de acceso asignados a tu cuenta.</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.roles.map(r => (
                  <span key={r.id} style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--accent-color)',
                    background: 'rgba(59,130,246,0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px'
                  }}>
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FormCard>
      </div>
    </div>
  );
};

export default ProfilePage;
