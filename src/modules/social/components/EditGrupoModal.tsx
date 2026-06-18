import { useState } from 'react';
import { gruposService, type Grupo } from '../services/gruposService';
import { showAlert } from '../../../shared/utils/alerts';

interface Props { grupo: Grupo; onClose: () => void; onUpdated: () => void; }

const EditGrupoModal = ({ grupo, onClose, onUpdated }: Props) => {
  const [form, setForm] = useState({
    nombre: grupo.nombre || '',
    descripcion: grupo.descripcion || '',
    esPublico: grupo.esPublico,
    imagen: grupo.imagen || '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return showAlert.warning('Nombre requerido', 'El nombre del grupo es obligatorio.');
    setIsProcessing(true);
    try {
      await gruposService.update(grupo.id, form);
      await showAlert.success('Grupo actualizado', 'Los cambios se guardaron correctamente.');
      onUpdated();
    } catch (err: any) {
      showAlert.error('Error', err?.response?.data?.message || 'No se pudo actualizar el grupo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const inicial = form.nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem', maxWidth: '480px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem' }}>Editar Grupo</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: form.imagen ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
            {form.imagen ? <img src={form.imagen} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : inicial}
          </div>
          <div>
            <label style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cambiar imagen
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {form.imagen && (
              <button type="button" onClick={() => setForm({ ...form, imagen: '' })} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                Quitar
              </button>
            )}
          </div>
        </div>

        {[
          { label: 'Nombre del grupo *', key: 'nombre' },
          { label: 'Descripción', key: 'descripcion' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{label}</label>
            <input type="text" value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem' }} />
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.esPublico} onChange={e => setForm({ ...form, esPublico: e.target.checked })} style={{ width: '18px', height: '18px' }} />
          <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>🌐 Grupo público (cualquiera puede unirse)</span>
        </label>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" disabled={isProcessing || !form.nombre.trim()} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, opacity: (isProcessing || !form.nombre.trim()) ? 0.6 : 1 }}>
            {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGrupoModal;