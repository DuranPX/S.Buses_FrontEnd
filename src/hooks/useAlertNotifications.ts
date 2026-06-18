import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { showAlert } from '../shared/utils/alerts';

export const useAlertNotifications = () => {

    useEffect(() => {

        const socket = socketService.getSocket();

        console.log(
            '[FRONT] Socket alerta existe?',
            !!socket
        );

        if (!socket) return;


        const alertaMasivaHandler = (data: any) => {

            console.log(
                '[FRONT] alerta_masiva recibida',
                data
            );


            showAlert.info(
                data.titulo || 'Alerta',
                data.mensaje
            );

        };


        const alertaUrgenteHandler = (data: any) => {

            console.log(
                '[FRONT] alerta_urgente recibida',
                data
            );


            showAlert.error(
                `🚨 ${data.titulo || 'Alerta urgente'}`,
                data.mensaje
            );

        };


        socket.on(
            'alerta_masiva',
            alertaMasivaHandler
        );


        socket.on(
            'alerta_urgente',
            alertaUrgenteHandler
        );


        return () => {

            socket.off(
                'alerta_masiva',
                alertaMasivaHandler
            );


            socket.off(
                'alerta_urgente',
                alertaUrgenteHandler
            );

        };


    }, []);

};