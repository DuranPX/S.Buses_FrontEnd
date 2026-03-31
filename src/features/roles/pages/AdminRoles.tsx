import { useState, useEffect } from "react";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { Button } from "../../../shared/components/ui/Button";
import { showAlert } from "../../../shared/utils/alerts";
import { useAuthorization } from "../hooks/useAuthorization";
import { AccessDenied } from "../../../shared/components/feedback/AccessDenied";
import { MODULES } from "../../../shared/config/modules";
import type { Role, Permission } from "../../auth/context/AuthContext";
import { securityApi } from "../../../api/api";

const mapFromBackend = (data: any): Role => ({
  id: data.id || data._id,
  name: data.nombre,
  description: data.descripcion,
  activo: data.activo,
  permisos: data.permisos || []
});

const mapToBackend = (role: Role): any => ({
  id: role.id?.includes('role-') ? null : role.id,
  nombre: role.name,
  descripcion: role.description,
  activo: role.activo,
  permisos: role.permisos
});

export const AdminRoles = () => {
  const { can, activeRole } = useAuthorization();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);


  if (!activeRole) return null;
  if (!can(MODULES.ROLES, 'leer')) return <AccessDenied module={MODULES.ROLES} />;


  useEffect(() => {
    securityApi.get("/api/roles")
      .then(res => {
        setRoles(res.data.map(mapFromBackend));
      })
      .catch(err => {
        console.error("Error cargando roles", err);
        showAlert.error("Error", "No se pudieron cargar los roles del sistema.");
      });
  }, []);

  const handleToggleStatus = (role: Role) => {
    if (!can(MODULES.ROLES, 'editar')) return;
    
    showAlert.warning(
      `¿Cambiar estado?`,
      `El rol ${role.name} pasará a estar ${role.activo ? 'inactivo' : 'activo'}.`
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedBackend = mapToBackend({ ...role, activo: !role.activo });
          await securityApi.put(`/api/roles/${role.id}`, updatedBackend);
          setRoles(roles.map(r => r.id === role.id ? { ...r, activo: !r.activo } : r));
          showAlert.success("Actualizado", "Estado del rol modificado correctamente.");
        } catch (error) {
          showAlert.error("Error", "No se pudo actualizar el estado.");
        }
      }
    });
  };

  const handleDeleteRole = (role: Role) => {
    if (!can(MODULES.ROLES, 'eliminar')) return;

    showAlert.warning(
      `Eliminar Rol`,
      `¿Estás seguro de que deseas eliminar el rol ${role.name}? Esta acción no se puede deshacer.`
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await securityApi.delete(`/api/roles/${role.id}`);
          setRoles(roles.filter(r => r.id !== role.id));
          showAlert.success("Eliminado", "El rol ha sido eliminado.");
        } catch (error) {
          showAlert.error("Error", "No se pudo eliminar el rol.");
        }
      }
    });
  };

  const openForm = (role: Role | null = null) => {
    if (role && !can(MODULES.ROLES, 'editar')) return;
    if (!role && !can(MODULES.ROLES, 'escribir')) return;

    setSelectedRole(role || {
      id: `role-${Date.now()}`,
      name: "",
      description: "",
      activo: true,
      permisos: []
    });
    setIsEditing(true);
  };

  const saveRole = async () => {
    if (!selectedRole) return;
    
    try {
      const payload = mapToBackend(selectedRole);
      
      if (roles.find(r => r.id === selectedRole.id)) {

        const res = await securityApi.put(`/api/roles/${selectedRole.id}`, payload);
        const updatedRole = mapFromBackend(res.data);
        setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
      } else {

        const res = await securityApi.post(`/api/roles`, payload);
        const newRole = mapFromBackend(res.data);
        setRoles([...roles, newRole]);
      }
      
      setIsEditing(false);
      setSelectedRole(null);
      showAlert.success("Guardado", "El rol ha sido guardado exitosamente.");
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "Ocurrió un error al guardar el rol.");
    }
  };

  if (isEditing && selectedRole) {
    return (
      <div className="admin-roles-form" style={{ padding: '2rem' }}>
        <FormCard title={selectedRole.id.includes('role-') && !roles.find(r => r.id === selectedRole.id) ? "Nuevo Rol" : `Editando: ${selectedRole.name}`}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre del Rol</label>
              <input 
                type="text" 
                value={selectedRole.name} 
                onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
              <textarea 
                value={selectedRole.description} 
                onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px' }}
              />
            </div>

            <div className="permissions-config">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Configuración de Permisos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.values(MODULES).filter(m => m !== 'dashboard').map(mod => {
                  const perm = selectedRole.permisos.find(p => p.modulo === mod) || { modulo: mod, leer: false, escribir: false, editar: false, eliminar: false };
                  
                  const updatePerm = (field: keyof Permission, value: boolean) => {
                    const newPerms = [...selectedRole.permisos];
                    const index = newPerms.findIndex(p => p.modulo === mod);
                    if (index >= 0) {
                      (newPerms[index] as any)[field] = value;
                    } else {
                      const newP = { modulo: mod, leer: false, escribir: false, editar: false, eliminar: false };
                      (newP as any)[field] = value;
                      newPerms.push(newP);
                    }
                    setSelectedRole({...selectedRole, permisos: newPerms});
                  };

                  return (
                    <div key={mod} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.5rem' }}>{mod}</div>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['leer', 'escribir', 'editar', 'eliminar'].map(action => (
                          <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="checkbox" 
                              checked={!!(perm as any)[action]} 
                              onChange={(e) => updatePerm(action as keyof Permission, e.target.checked)} 
                            />
                            {action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button label="Guardar Cambios" onClick={saveRole} />
              <Button label="Cancelar" onClick={() => setIsEditing(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="admin-roles-page" style={{ padding: '2rem' }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Gestión de Roles y Permisos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configura los perfiles de acceso dinámicamente.</p>
        </div>
        {can(MODULES.ROLES, 'escribir') && (
          <Button label="+ Nuevo Rol" onClick={() => openForm()} />
        )}
      </div>

      <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {roles.map((role) => (
          <FormCard key={role.id} title={role.name}>
            <div className="role-details">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>
                {role.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Permisos por Módulo:</span>
                <span className={`badge ${role.activo ? 'active' : 'inactive'}`} style={{ 
                  backgroundColor: role.activo ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: role.activo ? '#22c55e' : '#ef4444',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {role.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              <div className="permissions-list" style={{ margin: '1rem 0', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {role.permisos.map((p) => (
                  <div key={p.modulo} style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <strong style={{ color: 'var(--accent-color)' }}>{p.modulo}:</strong> {
                      [p.leer && 'R', p.escribir && 'W', p.editar && 'E', p.eliminar && 'D'].filter(Boolean).join('|')
                    }
                  </div>
                ))}
              </div>

              <div className="card-footer" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {can(MODULES.ROLES, 'editar') && (
                  <Button 
                    label="Editar" 
                    onClick={() => openForm(role)} 
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', flex: 1, fontSize: '0.8rem' }} 
                  />
                )}
                {can(MODULES.ROLES, 'editar') && (
                  <Button 
                    label={role.activo ? "Desactivar" : "Activar"} 
                    onClick={() => handleToggleStatus(role)} 
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', flex: 1, fontSize: '0.8rem', color: role.activo ? '#eab308' : '#22c55e' }} 
                  />
                )}
                {can(MODULES.ROLES, 'eliminar') && (
                  <Button 
                    label="Eliminar" 
                    onClick={() => handleDeleteRole(role)} 
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', flex: 1, fontSize: '0.8rem' }} 
                  />
                )}
              </div>
            </div>
          </FormCard>
        ))}
      </div>
    </div>
  );
};

export default AdminRoles;
