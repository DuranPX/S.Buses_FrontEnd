/**
 * Utilidad para carga dinámica del script de ePayco Checkout en React.
 */
export const loadEpaycoScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).ePayco) {
      resolve((window as any).ePayco);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve((window as any).ePayco);
    script.onerror = () => reject(new Error('Error al cargar script de ePayco'));
    document.body.appendChild(script);
  });
};
