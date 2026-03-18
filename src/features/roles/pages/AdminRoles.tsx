import { useState } from "react";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { Button } from "../../../shared/components/ui/Button";
import { showAlert } from "../../../shared/utils/alerts";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export const AdminRoles = () => {
  const [roles] = useState<Role[]>([
    { id: "1", name: "ADMIN", permissions: ["ALL"] },
    { id: "2", name: "OPERATOR", permissions: ["VIEW_DASHBOARD", "EDIT_BUSES"] },
    { id: "3", name: "USER", permissions: ["VIEW_DASHBOARD"] },
  ]);

  return (
    <div className="admin-roles-page" style={{ padding: '2rem' }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Gestión de Roles y Permisos</h1>
        <Button label="Nuevo Rol" onClick={() => showAlert.info("Función de prueba", "Aquí abrirías el formulario para crear un nuevo rol.")} />
      </div>

      <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {roles.map((role) => (
          <FormCard key={role.id} title={role.name}>
            <div className="role-details">
              <p><strong>Permisos:</strong></p>
              <div className="permissions-list" style={{ margin: '1rem 0', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {role.permissions.map((p) => (
                  <span key={p} className="badge">{p}</span>
                ))}
              </div>
              <div className="card-footer" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Button label="Editar" onClick={() => showAlert.info(`Editar Rol`, `Acción simulada para el rol ${role.name}`)} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Button label="Eliminar" onClick={() => showAlert.warning(`Eliminar Rol`, `¿Estás seguro de que deseas eliminar el rol ${role.name}?`)} style={{ backgroundColor: '#ef4444' }} />
              </div>
            </div>
          </FormCard>
        ))}
      </div>
    </div>
  );
};

export default AdminRoles;
