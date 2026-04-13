import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateUserProfile } from "../services/auth.service";
import { showAlert } from "../../../shared/utils/alerts";
import { InputField } from "../../../shared/components/forms/InputField";
import { Button } from "../../../shared/components/ui/Button";

const phoneRegex = /^[+]?[0-9]{7,15}$/;

/**
 * Modal overlay que detecta si un usuario OAuth tiene phone/address vacíos
 * y muestra un formulario de completación de perfil antes de permitir el acceso.
 * 
 * Se renderiza como componente hermano del layout — si no necesita mostrar nada,
 * retorna null. Si necesita mostrar el modal, se superpone con position:fixed.
 */
export const ProfileCompletionGuard = () => {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: ""
  });

  // Si no hay user, no mostrar nada
  if (!user) return null;

  // Un usuario OAuth-only se detecta si tiene authExternals Y su phone/address están vacíos
  const isOAuthUser = (user.authExternals?.length ?? 0) > 0;
  const needsCompletion = isOAuthUser && (!user.phone || !user.address);

  // Si ya completó su perfil, o decidió omitir → no mostrar nada
  if (!needsCompletion || skipped) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneRegex.test(formData.phone)) {
      showAlert.warning("Teléfono inválido", "El teléfono debe tener entre 7 y 15 dígitos numéricos.");
      return;
    }

    if (formData.address.trim().length < 3) {
      showAlert.warning("Dirección inválida", "Por favor ingresa una dirección válida.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updateUserProfile(user.id, {
        phone: formData.phone,
        address: formData.address
      });

      // Actualizar el usuario en el contexto global (reactivo en navbar, sidebar, perfil, etc.)
      if (result) {
        updateUser({
          phone: result.phone || formData.phone,
          address: result.address || formData.address
        });
      } else {
        updateUser({ phone: formData.phone, address: formData.address });
      }

      showAlert.success("¡Perfil actualizado!", "Tu información ha sido guardada correctamente.");
    } catch (err) {
      // El error se muestra por handleApiError
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerName = user.authExternals?.[0]?.proveedor || "OAuth";

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'fadeIn 0.3s ease'
      }}>
        {/* Header con avatar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 1rem',
            border: '3px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            fontSize: '1.8rem'
          }}>
            {user.photo ? (
              <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user.name || "U")[0].toUpperCase()
            )}
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>
            ¡Bienvenido, {user.name}!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
            Tu cuenta fue creada con <strong style={{ color: 'white' }}>{providerName}</strong>. 
            Para completar tu registro, necesitamos algunos datos adicionales.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputField
            label="Número de Teléfono"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+573001234567"
            required
          />

          <InputField
            label="Dirección"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Calle 123 #45-67, Manizales"
            required
          />

          <Button
            type="submit"
            label={isSubmitting ? "Guardando..." : "Completar Perfil"}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />

          <button
            type="button"
            onClick={() => setSkipped(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              textDecoration: 'underline'
            }}
          >
            Omitir por ahora
          </button>

          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '0.25rem',
            opacity: 0.7
          }}>
            Podrás actualizar esta información después en la sección de Perfil.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionGuard;
