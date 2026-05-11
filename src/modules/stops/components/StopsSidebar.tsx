
import type { NearbyStop } from '../types/stop.types';
import { StopCard } from './StopCard';
import { NearbyBusIndicator } from './NearbyBusIndicator';
import { useNearbySocket } from '../hooks/useNearbySocket';

interface Props {
  stops: NearbyStop[];
  selectedStopId: string | null;
  onStopSelect: (id: string) => void;
}

export const StopsSidebar = ({ stops, selectedStopId, onStopSelect }: Props) => {
  const { arrivingBuses } = useNearbySocket(selectedStopId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem', scrollbarWidth: 'thin' }}>
        {stops.map(stop => (
          <StopCard 
            key={stop.id} 
            stop={stop} 
            isSelected={stop.id === selectedStopId}
            onClick={() => onStopSelect(stop.id)}
          />
        ))}
      </div>

      {selectedStopId && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Llegadas en tiempo real
          </h4>
          <NearbyBusIndicator buses={arrivingBuses} />
        </div>
      )}
    </div>
  );
};
