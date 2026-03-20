import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

interface AccessDeniedProps {
  message?: string;
  module?: string;
}

export const AccessDenied = ({ 
  message = "No tienes los permisos necesarios para acceder a esta sección.",
  module 
}: AccessDeniedProps) => {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '70vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="icon" style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛡️</div>
      <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Acceso Denegado</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>
        {message} {module && `(Módulo: ${module})`}
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button label="Volver al Dashboard" onClick={() => navigate("/dashboard")} />
        <Button 
          label="Cerrar Sesión" 
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }} 
          style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>
    </div>
  );
};

export default AccessDenied;
