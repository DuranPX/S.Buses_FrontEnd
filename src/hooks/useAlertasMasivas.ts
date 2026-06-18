import { useEffect } from 'react';
import { notifSocket, connectNotifSocket } from '../websocket/notifSocket';
import { useAuth } from '../features/auth/hooks/useAuth';
import { showAlert } from '../shared/utils/alerts';

export const useAlertasMasivas = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Conectar con el token del usuario
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
        if (token) connectNotifSocket(token);

        const handleAlerta = (data: any) => {
            console.log('[NOTIF] alerta_masiva recibida:', data);
            if (data.urgente) {
                showAlert.error(
                    `URGENTE: ${data.titulo}`,
                    data.mensaje
                );
            } else {
                showAlert.info(
                    `${data.titulo}`,
                    data.mensaje
                );
            }
        };

        const handleAlertaUrgente = (data: any) => {
            showAlert.error(
                `URGENTE: ${data.titulo}`,
                data.mensaje
            );
        };

        notifSocket.on('alerta_masiva', handleAlerta);
        notifSocket.on('alerta_urgente', handleAlertaUrgente);

        return () => {
            notifSocket.off('alerta_masiva', handleAlerta);
            notifSocket.off('alerta_urgente', handleAlertaUrgente);
        };
    }, [user]);
};