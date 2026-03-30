import { useState, useEffect } from "react";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { Button } from "../../../shared/components/ui/Button";
import { showAlert } from "../../../shared/utils/alerts";
import { useAuthorization } from "../../roles/hooks/useAuthorization";
import { AccessDenied } from "../../../shared/components/feedback/AccessDenied";
import { MODULES } from "../../../shared/config/modules";
import { securityApi } from "../../../api/api";
import type { Role } from "../../auth/context/AuthContext";

interface UserProfile {
  id: string; // backend could bring id or _id
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  roles: Role[]; // Extrapolando del modelo de roles
}

export const AdminUsers = () => {
  const { can, activeRole } = useAuthorization();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [systemRoles, setSystemRoles] = useState<Role[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Security barrier
  if (!activeRole) return null;
  if (!can(MODULES.USUARIOS, 'leer')) return <AccessDenied module={MODULES.USUARIOS} />;

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usrRes, rlsRes] = await Promise.all([
        securityApi.get('/api/users'),
        securityApi.get('/api/roles')
      ]);

      const normalizedUsers = usrRes.data.map((u: any) => ({
        ...u,
        id: u.id || u._id,
        roles: u.roles || []
      }));

      const normalizedRoles = rlsRes.data.map((r: any) => ({
        id: r.id || r._id,
        name: r.nombre,
        description: r.descripcion
      }));

      setUsers(normalizedUsers);
      setSystemRoles(normalizedRoles);
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "Ocurrió un error cargando los datos del sistema.");
    }
  };

  const openForm = (user: UserProfile | null = null) => {
    if (user && !can(MODULES.USUARIOS, 'editar')) return;
    if (!user && !can(MODULES.USUARIOS, 'escribir')) return;

    setSelectedUser(user || {
      id: `tmp-${Date.now()}`,
      name: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      roles: []
    });
    setIsEditing(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (!can(MODULES.USUARIOS, 'eliminar')) return;

    showAlert.warning(
      `Eliminar Usuario`,
      `¿Deseas eliminar a ${user.name} ${user.lastName}?`
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await securityApi.delete(`/api/users/${user.id}`);
          setUsers(users.filter(u => u.id !== user.id));
          showAlert.success("Eliminado", "Usuario removido de la plataforma.");
        } catch (error) {
          showAlert.error("Error", "No se pudo eliminar el usuario.");
        }
      }
    });
  };

  const handleToggleRoleForUser = async (role: Role, isChecked: boolean) => {
    if (!selectedUser || !can(MODULES.USUARIOS, 'editar')) return;
    
    // El backend se actualizará para aceptar el Nombre directamente en lugar del ID,
    // así garantizamos que se guarde el Array Strings limpio en MongoDB.
    const roleIdentifier = role.name;

    // Solo llamamos a la API si el usuario ya existe en Mongo
    if (!selectedUser.id.startsWith('tmp-')) {
      try {
        if (isChecked) {
          await securityApi.post(`/api/users/${selectedUser.id}/roles/${roleIdentifier}`);
        } else {
          await securityApi.delete(`/api/users/${selectedUser.id}/roles/${roleIdentifier}`);
        }
        showAlert.success("Roles Actualizados", `El rol ha sido ${isChecked ? 'asignado' : 'removido'}.`);
      } catch (error) {
        showAlert.error("Fallo de Asignación", "No pudimos modificar los roles de este usuario.");
        return; // Don't update UI state since API failed
      }
    }

    // Actualizar Estado UI
    let newRoles = [...selectedUser.roles];
    if (isChecked) {
      newRoles.push(role);
    } else {
      newRoles = newRoles.filter((r: any) => (r.id || r._id) !== role.id && r !== role.name && r !== role.id);
    }
    
    setSelectedUser({ ...selectedUser, roles: newRoles });
    
    // Update main tracking array si ya existe
    if (!selectedUser.id.startsWith('tmp-')) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, roles: newRoles } : u));
    }
  };

  const saveUser = () => {
    // A petición por bug del backend al modificar perfiles base, el botón sólo opera 
    // como decoración para cerrar el panel (el checkbox asigna/quita roles asincrónicamente con éxito).
    setIsEditing(false);
    setSelectedUser(null);
  };


  if (isEditing && selectedUser) {
    return (
      <div className="admin-users-form" style={{ padding: '2rem' }}>
        <FormCard title={selectedUser.id.startsWith('tmp-') ? "Alta de Usuario Administrativo" : `Editando: ${selectedUser.name}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
            
            {/* Info Basica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Nombre(s)</label>
                <input type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Apellidos</label>
                <input type="text" value={selectedUser.lastName} onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Correo Institucional / Profesional</label>
                <input type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} disabled={!selectedUser.id.startsWith('tmp-')}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', opacity: !selectedUser.id.startsWith('tmp-') ? 0.5 : 1 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Número Telefónico</label>
                <input type="tel" value={selectedUser.phone} onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
            </div>

            {/* Asignacion Roles Inteligente */}
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Roles Asignados</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Adjudica o retira privilegios de forma instantánea al habilitar el checkbox correspondiente.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {systemRoles.map((role) => {
                  const hasRole = selectedUser.roles.some((r: any) => (r.id || r._id) === role.id || (typeof r === 'string' && r === role.name));
                  
                  return (
                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                      <input 
                        type="checkbox" 
                        checked={hasRole}
                        tabIndex={-1}
                        onChange={(e) => handleToggleRoleForUser(role, e.target.checked)}
                        style={{ width: '1.1rem', height: '1.1rem' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{role.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <Button label="Guardar Empleado" onClick={saveUser} />
              <Button label="Cancelar" onClick={() => setIsEditing(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="admin-users-page" style={{ padding: '2rem' }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-muted)' }}>Listado de personal autorizado, suscriptores del sistema y accesos.</p>
        </div>
        {can(MODULES.USUARIOS, 'escribir') && (
          <Button label="+ Conceder Acceso" onClick={() => openForm()} />
        )}
      </div>

      <div className="users-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {users.map((u) => (
          <FormCard key={u.id} title={`${u.name} ${u.lastName}`}>
            <div className="user-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>✉️</span>
                <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>📱</span>
                <span style={{ color: 'var(--text-muted)' }}>{u.phone}</span>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--text-muted)' }}>Manto Autorizado</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {u.roles?.length ? u.roles.map((r: any) => {
                    const rName = typeof r === 'string' ? r : (r.nombre || r.name);
                    return (
                      <span key={r.id || rName} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {rName}
                      </span>
                    )
                  }) : <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Sin privilegios operacionales</span>}
                </div>
              </div>

              <div className="card-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                {can(MODULES.USUARIOS, 'editar') && (
                  <Button label="Inspeccionar" onClick={() => openForm(u)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', fontSize: '0.8rem' }} />
                )}
                {can(MODULES.USUARIOS, 'eliminar') && (
                  <Button label="Revocar" onClick={() => handleDeleteUser(u)} style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8rem' }} />
                )}
              </div>
            </div>
          </FormCard>
        ))}
        {users.length === 0 && (
           <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay usuarios reflejados en la plataforma.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
