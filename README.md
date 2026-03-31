# Sistema de Gestión Inteligente "Buses Manizales" - Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**Estado del Proyecto:** `90% Completado`
*(**Nota**: El 10% restante corresponde a la integración pendiente de proveedores OAuth 2.0 como Google, GitHub y Azure, la cual se integrará al backend primero por parte del equipo colaborador).*

---

## Arquitectura y Domain-Driven Design (DDD)

Para garantizar que este ecosistema pueda acoger nuevos módulos, crecer de forma mantenible y evitar el "código espagueti", hemos moldeado y organizado toda la capa de React aplicando filosofías de diseño moderno y Domain-Driven Design (DDD).

El núcleo `src` está estructurado bajo **Feature-Sliced Design / Vertical Slicing**:
- `/features`: Cada bloque del dominio del negocio (Usuarios, Roles, Auth, Dashboard, Vehículos) se encuentra encapsulado con sus propios componentes (`/components`), manejadores de estado (`/context` o `/hooks`), y servicios HTTP independientes.
- `/shared`: Componentes UI reutilizables puros (botones, modales, formularios), *layouts* y utilidades que no poseen estado de negocio específico.
- `/api`: Núcleo de la conexión HTTP agnóstica a la vista, estandarizando peticiones.
- `/router`: Enrutadores dinámicos abstractos que inyectan los requerimientos exigidos por los flujos de la aplicación.

## Principios S.O.L.I.D y Clean Code

- **Single Responsibility (SRP):** Ejemplificado en herramientas nativas como `useAuthorization.ts`. El Hook solo responde la pregunta de *¿Puede el usuario actual leer este módulo?*, dejando que el componente que lo llama se encargue en su totalidad de manipular la respuesta.
- **Dependency Inversion (DIP):** Los componentes de presentación jamás ejecutan validaciones directas de contraseñas ni arman peticiones complejas; operan sobre delegaciones hacia repositorios como `auth.service.ts` o abstrayendo al Contexto Global (`AuthContext`).

## Infraestructura de Seguridad End-to-End

El proyecto se sostiene en sus rígidas normativas de seguridad que protegen la información y encriptan los alcances administrativos.

### Control de Accesos Basado en Roles (RBAC) y Principio de Menor Privilegio (POLP)
- **POLP:** En lugar de dar permisos amplios de "Admin" o "Usuario", el token JWT transporta los permisos estrictamente fragmentados (Leer, Escribir, Editar, Eliminar) otorgados para cada módulo en tiempo real. 
- **Verificación Dinámica:** La aplicación renderiza masivamente el `Sidebar` y los sub-componentes UI descartando por completo aquello de lo que el Payload del usuario no tiene privilegio. El usuario sólo verá y cargará los bytes necesarios.

### Prevención con Guardianes de Rutas (`Guards`)
Todo intento forzado de ingreso mediante URLs (Ej: `/admin/roles` o `/verify-code`) debe testearse ante un batallón de Componentes React especializados que interceptan el ciclo del Router:
1. `PrivateRoute / ProtectedRoute`: Restringen interfaces corporativas si en el ciclo activo no hay credenciales correctas en RAM/Storage, o devuelven al visitante a la barrera `<AccessDenied />`.
2. `PublicOnlyRoute`: Barrera inversa que previene que los usuarios en sesión pierdan tiempo logueándose doble.
3. `AuthFlowGuard`: Prevención exhaustiva de brechas lógicas en peticiones como **2FA** y **Reset Password**: Garantizando que solo se accede a las interfaces vitales al demostrar haber seguido la ruta lógica impuesta por AuthFlowContext (Email, reCAPTCHA, Tokens).

### Axios Interceptors
Programados sobre la instancia global, se encargan silenciósamente de dos proezas maestras:
- **Attach-Bearer:** Se engrapan automáticamente a los *Headers* la llave de Autorización para legitimar las comunicaciones.
- **Global Error Handling:** Atrapan errores `401 Unauthorized` de todo contexto para destruir la sesión local, purificar el Front y abortar sin quebrar la experiencia final.

---

## Instalación y Despliegue Local

1. Clona el repositorio
   ```bash
   git clone https://github.com/DuranPX/S.Buses_FrontEnd.git
   ```
2. Instala las dependencias del ecosistema de Node.js
   ```bash
   npm install
   ```
3. Levanta tu entorno local bajo la integración *Hot-reload* de Vite
   ```bash
   npm run dev
   ```