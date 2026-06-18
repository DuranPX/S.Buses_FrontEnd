import { useState, useEffect } from 'react';
import { gruposService } from '../services/gruposService';
import { showAlert } from '../../../shared/utils/alerts';
import { businessApi } from '../../../api/api';

interface PersonaOption { id: string; firstName: string; lastName: string; email: string; }
interface Props { onClose: () => void; onCreated: () => void; }

const CreateGrupoModal = ({ onClose, onCreated }: Props) => {
  const [form, setForm] = useState({ nombre: '', descripcion: '', esPublico: false, imagen: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Búsqueda de personas
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<PersonaOption[]>([]);
  const [seleccionados, setSeleccionados] = useState<PersonaOption[]>([]);

  useEffect(() => {
    if (busqueda.trim().length < 2) { setResultados([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await businessApi.get(`/persona?search=${encodeURIComponent(busqueda)}`);
        console.log('Respuesta búsqueda:', data);
        setResultados(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error búsqueda:', err);
        setResultados([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      return showAlert.warning('Imagen muy grande', 'La imagen debe pesar menos de 1MB.');
    }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, imagen: reader.result as string });
    reader.readAsDataURL(file);
  };

  const toggleSeleccionado = (persona: PersonaOption) => {
    setSeleccionados(prev =>
      prev.some(p => p.id === persona.id)
        ? prev.filter(p => p.id !== persona.id)
        : [...prev, persona]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return showAlert.warning('Nombre requerido', 'El nombre del grupo es obligatorio.');
    if (seleccionados.length < 2) {
      return showAlert.warning('Faltan miembros', 'Debes agregar al menos 2 miembros además de ti.');
    }
    setIsProcessing(true);
    try {
      await gruposService.create({ ...form, miembrosIds: seleccionados.map(p => p.id) });
      await showAlert.success('Grupo creado', `El grupo "${form.nombre}" fue creado exitosamente.`);
      onCreated();
    } catch (err: any) {
      showAlert.error('Error', err?.response?.data?.message || 'No se pudo crear el grupo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const inicial = form.nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem', maxWidth: '520px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem' }}>Crear Grupo</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
        </div>

        {/* Imagen / avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: form.imagen ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
            {form.imagen ? <img src={form.imagen} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : inicial}
          </div>
          <div>
            <label style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem' }}>
              Subir imagen
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {form.imagen && (
              <button type="button" onClick={() => setForm({ ...form, imagen: '' })} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                Quitar
              </button>
            )}
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Si no subes imagen, se usará la inicial del nombre.
            </p>
          </div>
        </div>

        {/* Nombre / descripción */}
        {[
          { label: 'Nombre del grupo *', key: 'nombre', placeholder: 'Ej. Usuarios Línea 1' },
          { label: 'Descripción', key: 'descripcion', placeholder: 'Breve descripción del grupo' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{label}</label>
            <input type="text" value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem' }} />
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.esPublico} onChange={e => setForm({ ...form, esPublico: e.target.checked })} style={{ width: '18px', height: '18px' }} />
          <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>🌐 Grupo público (cualquiera puede unirse)</span>
        </label>

        {/* Selector de miembros */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
            Agregar miembros * (mínimo 2)
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.5rem' }}
          />

          {resultados.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '140px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '0.5rem' }}>
              {resultados.map(p => {
                const yaSeleccionado = seleccionados.some(s => s.id === p.id);
                return (
                  <div key={p.id} onClick={() => toggleSeleccionado(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', background: yaSeleccionado ? 'rgba(99,102,241,0.15)' : 'transparent' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{p.firstName} {p.lastName} <span style={{ color: '#64748b' }}>· {p.email}</span></span>
                    {yaSeleccionado && <span style={{ color: '#a5b4fc' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Chips de seleccionados */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {seleccionados.map(p => (
              <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem' }}>
                {p.firstName} {p.lastName}
                <button type="button" onClick={() => toggleSeleccionado(p)} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: seleccionados.length < 2 ? '#fbbf24' : '#34d399' }}>
            {seleccionados.length} de 2 miembros mínimos seleccionados
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" disabled={isProcessing || !form.nombre.trim() || seleccionados.length < 2} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, opacity: (isProcessing || !form.nombre.trim() || seleccionados.length < 2) ? 0.6 : 1 }}>
            {isProcessing ? 'Creando...' : 'Crear Grupo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGrupoModal;