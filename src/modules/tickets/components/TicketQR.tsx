interface Props {
  value: string;
  size?: number;
}

// Un placeholder simple para el QR. En una app real se usaría algo como 'qrcode.react'
export const TicketQR = ({ value, size = 150 }: Props) => {
  return (
    <div style={{
      width: size,
      height: size,
      background: 'white',
      padding: '10px',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'none' }}>{value}</div>
      {/* Patrón de cuadros estático simulando un QR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '4px',
        width: '100%',
        height: '100%',
      }}>
        {Array.from({ length: 36 }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              background: Math.random() > 0.4 ? 'black' : 'transparent',
              borderRadius: '2px'
            }} 
          />
        ))}
      </div>
      
      {/* Logos centrales */}
      <div style={{
        position: 'absolute',
        background: 'white',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        color: '#6366f1'
      }}>
        SB
      </div>
    </div>
  );
};
