import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const require2fa = searchParams.get('require2fa');
    const email = searchParams.get('email');

    if (token) {
      // 1. Caso: Login directo sin 2FA
      localStorage.setItem('token', token);
      navigate('/dashboard'); // Y listos para seleccionar el rol
    } else if (require2fa === 'true') {
      // 2. Caso: OAuth fue exitoso pero pedimos 2FA extra
      // Mandarlo a la pantalla del "Pin" y guardamos el email que nos vino
      navigate(`/verify-code?email=${email}`);
    }
  }, [searchParams, navigate]);

  return <div>Procesando autenticación segura...</div>;
}

export default AuthSuccess;
