/**
 * Enmascara un email para mostrar de forma segura.
 * Ejemplo: "juan.duran@gmail.com" → "ju***@***.com"
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***@***.com';

  const [localPart, domain] = email.split('@');
  const [domainName, ...tldParts] = domain.split('.');
  const tld = tldParts.join('.');

  const maskedLocal = localPart.length > 2
    ? localPart.slice(0, 2) + '***'
    : localPart[0] + '***';

  const maskedDomain = domainName.length > 0
    ? '***'
    : '***';

  return `${maskedLocal}@${maskedDomain}.${tld || 'com'}`;
};
