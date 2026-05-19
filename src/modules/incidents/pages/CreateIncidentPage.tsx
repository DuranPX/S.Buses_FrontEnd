// src/modules/incidents/pages/CreateIncidentPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentForm } from '../components/IncidentForm';
import { incidentsService } from '../services/incidentsService';
import { showAlert } from '../../../shared/utils/alerts';
import { useDriverShift } from '../../drivers/hooks/useDriverShift';
import type { CreateIncidenteDto } from '../types/incident.types';
import type { BusCondition } from '../../drivers/types/driver.types';

const CreateIncidentPage = () => {
  const navigate = useNavigate();

  const [isProcessingIncident, setIsProcessingIncident] = useState(false);

  const {
    shift,
    isLoading: loadingShift,
    isProcessing: processingShift,
    startShift,
    endShift,
    error: shiftError,
  } = useDriverShift();

  // Form estado del bus
  const [condition, setCondition] = useState<BusCondition>({
    nivel_combustible: 100,
    presion_llantas: 'OK',
    luces: 'OK',
    frenos: 'OK',
    limpieza: 'Buena',
    observaciones: '',
  });

  const handleStartShift = async () => {
    const success = await startShift(condition);

    if (success) {
      showAlert.success(
        'Turno iniciado',
        'Tu turno fue activado correctamente.',
      );
    } else {
      showAlert.error(
        'No se pudo iniciar el turno',
        shiftError || 'Verifica la información del vehículo.',
      );
    }
  };

  const handleEndShift = async () => {
    const success = await endShift();

    if (success) {
      showAlert.success(
        'Turno finalizado',
        'El turno fue cerrado correctamente.',
      );
    } else {
      showAlert.error(
        'Error',
        'No se pudo finalizar el turno.',
      );
    }
  };

  const handleSubmit = async (
    data: CreateIncidenteDto,
    fotos: File[],
  ) => {
    if (!shift?.bus_id || shift.estado !== 'EN_CURSO') {
      showAlert.error(
        'Sin turno activo',
        'Debes tener un turno EN_CURSO para reportar incidentes.',
      );
      return;
    }

    setIsProcessingIncident(true);

    try {
      // Crear incidente
      const incidente = await incidentsService.createIncidente(data);

      // Asociar incidente al bus + fotos
      await incidentsService.reportarConFotos(
        {
          incidente_id: incidente.id,
          bus_id: shift.bus_id,
        },
        fotos,
      );

      showAlert.success(
        '¡Incidente reportado!',
        'El incidente fue enviado correctamente.',
      );

      navigate('/incidentes/historial');
    } catch {
      showAlert.error(
        'Error al reportar',
        'No se pudo registrar el incidente.',
      );
    } finally {
      setIsProcessingIncident(false);
    }
  };

  const isShiftStarted = shift?.estado === 'EN_CURSO';

  return (
    <div
      style={{
        padding: '1rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: '#f8fafc',
            }}
          >
            Maneja tu turno
          </h1>

          <p
            style={{
              color: '#94a3b8',
              margin: 0,
            }}
          >
            Gestiona tu turno y reporta novedades del servicio.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Estado */}
      {loadingShift ? (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.04)',
            color: '#cbd5e1',
          }}
        >
          Cargando información del turno...
        </div>
      ) : shift ? (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '1rem',
            background: isShiftStarted
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(245,158,11,0.1)',
            border: isShiftStarted
              ? '1px solid rgba(34,197,94,0.2)'
              : '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: '#f8fafc',
                  marginBottom: '0.35rem',
                }}
              >
                🚌 Turno del conductor
              </h3>

              <p
                style={{
                  margin: 0,
                  color: '#cbd5e1',
                  fontSize: '0.92rem',
                }}
              >
                Estado:
                <strong style={{ marginLeft: '0.4rem' }}>
                  {shift.estado}
                </strong>
              </p>

              <p
                style={{
                  margin: '0.25rem 0 0',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                }}
              >
                Bus:
                <strong style={{ marginLeft: '0.4rem' }}>
                  {shift.bus_placa || shift.bus_id}
                </strong>
              </p>
            </div>

            {/* BOTÓN FINALIZAR */}
            {isShiftStarted && (
              <button
                onClick={handleEndShift}
                disabled={processingShift}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.8rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  opacity: processingShift ? 0.7 : 1,
                }}
              >
                {processingShift
                  ? 'Finalizando...'
                  : '⏹ Finalizar turno'}
              </button>
            )}
          </div>

          {/* FORMULARIO SOLO SI EL TURNO ESTÁ PROGRAMADO */}
          {!isShiftStarted && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h4
                style={{
                  color: '#f8fafc',
                  marginTop: 0,
                  marginBottom: '1rem',
                }}
              >
                Estado inicial del bus
              </h4>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                  gap: '1rem',
                }}
              >
                {/* Combustible */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    Combustible (%)
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={condition.nivel_combustible}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        nivel_combustible: Number(e.target.value),
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: '0.6rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#0f172a',
                      color: 'white',
                    }}
                  />
                </div>

                {/* Llantas */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    Presión llantas
                  </label>

                  <select
                    value={condition.presion_llantas}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        limpieza: e.target.value as BusCondition['limpieza'],
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: '0.6rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#0f172a',
                      color: 'white',
                    }}
                  >
                    <option value="OK">OK</option>
                    <option value="BAJA">Baja</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>

                {/* Luces */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    Luces
                  </label>

                  <select
                    value={condition.luces}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        luces: e.target.value as BusCondition['luces'],
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: '0.6rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#0f172a',
                      color: 'white',
                    }}
                  >
                    <option value="OK">OK</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MAL">Mal</option>
                  </select>
                </div>

                {/* Frenos */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    Frenos
                  </label>

                  <select
                    value={condition.frenos}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        frenos: e.target.value as BusCondition['frenos'],
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: '0.6rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#0f172a',
                      color: 'white',
                    }}
                  >
                    <option value="OK">OK</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MAL">Mal</option>
                  </select>
                </div>

                {/* Limpieza */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    Limpieza
                  </label>

                  <select
                    value={condition.limpieza}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        limpieza: e.target.value as BusCondition['limpieza'],
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: '0.6rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#0f172a',
                      color: 'white',
                    }}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Buena">Buena</option>
                    <option value="Regular">Regular</option>
                    <option value="Mala">Mala</option>
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div style={{ marginTop: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                  }}
                >
                  Observaciones
                </label>

                <textarea
                  value={condition.observaciones}
                  onChange={(e) =>
                    setCondition((prev) => ({
                      ...prev,
                      observaciones: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Detalles del estado del vehículo..."
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.7rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: '#0f172a',
                    color: 'white',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* BOTÓN INICIAR */}
              <button
                onClick={handleStartShift}
                disabled={processingShift}
                style={{
                  marginTop: '1.5rem',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.9rem 1.4rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  opacity: processingShift ? 0.7 : 1,
                }}
              >
                {processingShift
                  ? 'Iniciando turno...'
                  : '▶ Iniciar turno'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5',
          }}
        >
          ⚠️ No tienes turnos programados para hoy.
        </div>
      )}

      {/* Formulario de incidentes */}
      <IncidentForm
        onSubmit={handleSubmit}
        isProcessing={isProcessingIncident}
      />
    </div>
  );
};

export default CreateIncidentPage;