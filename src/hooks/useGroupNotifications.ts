import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { showAlert } from '../shared/utils/alerts';

export const useGroupNotifications = () => {
    useEffect(() => {
        const socket = socketService.getSocket();

        console.log(
            '[FRONT] Socket existe?',
            !!socket
        );

        console.log(
            '[FRONT] Socket conectado?',
            socket?.connected
        );

        if (!socket) return;

        const handler = (data: any) => {
            console.log(
                '[FRONT] grupo_notificacion recibida',
                data
            );

            switch (data.tipo) {

                case 'INVITACION':
                    showAlert.info(
                        'Invitación a grupo',
                        data.mensaje
                    );
                    break;

                case 'BIENVENIDA':
                    showAlert.success(
                        'Bienvenido',
                        data.mensaje
                    );
                    break;

                case 'AGREGADO':
                    showAlert.success(
                        'Grupo',
                        data.mensaje
                    );
                    break;

                case 'REMOVIDO':
                    showAlert.warning(
                        'Grupo',
                        data.mensaje
                    );
                    break;

                case 'BLOQUEADO':
                    showAlert.error(
                        'Grupo',
                        data.mensaje
                    );
                    break;

                default:
                    console.log(
                        '[FRONT] grupo_notificacion recibida',
                        data
                    );

                    showAlert.info(
                        'Notificación',
                        data.mensaje
                    );
            }
        };

        socket.on('grupo_notificacion', handler);

        return () => {
            socket.off('grupo_notificacion', handler);
        };
    }, []);
};