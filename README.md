# Sistema de Buses Inteligentes – Frontend

Frontend del **Sistema de Buses Inteligentes**, una plataforma que permite gestionar la operación de transporte público urbano, incluyendo autenticación de usuarios, gestión de roles, rutas, buses y comunicación entre actores del sistema.

Este proyecto forma parte del desarrollo de la materia **Desarrollo Backend** y se integra con una arquitectura basada en **microservicios**.

---

# Tecnologías Utilizadas

* **React**
* **TypeScript**
* **React Router DOM**
* **Axios**
* **JWT (JSON Web Token)**
* **Vite**

---

# Arquitectura del Sistema

El sistema sigue una arquitectura basada en **microservicios**, donde el frontend se comunica con diferentes servicios del backend.

### Microservicios del Backend

* **Microservicio de Seguridad**

  * Framework: Spring Boot
  * Base de datos: MongoDB
  * Función:

    * Autenticación
    * Gestión de usuarios
    * Gestión de roles y permisos
    * Generación y validación de JWT

* **Microservicio de Negocio**

  * Framework: AdonisJS
  * Base de datos: MySQL
  * Función:

    * Gestión de buses
    * Gestión de rutas
    * Programaciones
    * Operación del sistema

* **Microservicio de Notificaciones**

  * Framework: Flask
  * Función:

    * Envío de correos
    * Notificaciones del sistema

---

# Estructura del Proyecto

```
SRC 
|   App.css
|   App.tsx
|   index.css
|   main.tsx
+---api
|       api.ts
|       axiosInterceptor.ts
+---assets
|   |   react.svg
|   \---images
|           azure provider.png
|           Catedral.avif
|           github_provider.png
|           google_provider.png
|           hero-bg.png
|           modern-city-bus-motion-yellow-public-vehicle-speed-blur-effect.jpg
|           mzls_bg.jpg
|           m_wnb.jpg
|           vehiculo_1.png
|           Vehiculo_2.jpg
|           Vehiculo_3.webp
+---features
|   +---auth
|   |   +---components
|   |   |       AuthFlowGuard.tsx
|   |   |       OAuthButtons.tsx
|   |   |       RoleSelector.tsx
|   |   +---context
|   |   |       AuthContext.tsx
|   |   |       AuthFlowContext.tsx
|   |   +---data
|   |   |       mockUsers.json
|   |   +---hooks
|   |   |       useAuth.ts
|   |   +---pages
|   |   |       ForgotPassword.tsx
|   |   |       Login.tsx
|   |   |       ResetPassword.tsx
|   |   |       VerifyCode.tsx
|   |   \---services
|   |           auth.service.tsx
|   +---dashboard
|   |   \---pages
|   |           Dashboard.tsx
|   +---landing
|   |   \---pages
|   |           Landing.tsx
|   \---roles
|       +---components
|       +---data
|       |       mockRoles.json
|       +---hooks
|       |       useAuthorization.ts
|       \---pages
|               AdminRoles.tsx
+---layouts
|       MainLayout.tsx
+---pages
+---router
|       AppRouter.tsx
|       AuthGuard.tsx
|       ProtectedRoute.tsx
+---routes
|       PrivateRoute.tsx
|       PublicOnlyRoute.tsx
+---shared
|   +---components
|   |   +---cards
|   |   |       FormCard.tsx
|   |   +---feedback
|   |   |       AccessDenied.tsx
|   |   +---forms
|   |   |       InputField.tsx
|   |   \---ui
|   |           Button.tsx
|   |           Grainient.css
|   |           Grainient.tsx
|   |           Loader.tsx
|   |           RotatingText.css
|   |           RotatingText.tsx
|   +---config
|   |       modules.tsx
|   +---layouts
|   |       Footer.tsx
|   |       MainLayout.tsx
|   |       Navbar.tsx
|   |       Sidebar.tsx
|   \---utils
|           alerts.ts
\---styles
        admin.css
        auth.css
        base.css
        components.css
        landing.css
        variables.css
```

---

# Funcionalidades Implementadas

### Autenticación

* Registro de usuarios
* Inicio de sesión
* Manejo de sesión mediante **JWT**
* Integración con backend de seguridad

### Rutas del Sistema

* `/login`
* `/register`
* `/dashboard`
* `/admin-roles`

Las rutas son gestionadas mediante **React Router**.

---

# Interceptor Axios y JWT

El proyecto utiliza **Axios** para manejar las solicitudes HTTP hacia los microservicios.

Se implementó un **interceptor de Axios** que adjunta automáticamente el **JWT** en el header de cada petición.

### Flujo de autenticación

1. El usuario inicia sesión en el sistema.
2. El backend (Spring Boot) valida las credenciales.
3. El backend genera un **JWT**.
4. El frontend guarda el token en **localStorage**.
5. El interceptor de Axios adjunta el token automáticamente en cada solicitud.

Ejemplo de header enviado:

```
Authorization: Bearer <JWT>
```

Esto permite que los microservicios validen la identidad del usuario en cada petición.

---

# Instalación del Proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
```

### 2. Entrar al proyecto

```bash
cd frontend-buses-inteligentes
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto se ejecutará en:

```
http://localhost:5173
```

---

# Antes de empezar cada día — sincronizar con main
git checkout tu-nombre
git merge main

# Trabajar y commitear
git add .
git commit -m "feat: descripción de lo que hiciste"
git push origin tu-nombre

# Buenas Prácticas Implementadas

* Uso de **TypeScript** para tipado estático
* Separación de responsabilidades por carpetas
* Uso de **componentes reutilizables**
* Configuración centralizada de **Axios**
* Uso de **interceptors** para manejo de autenticación

---

# Autores

Proyecto desarrollado por el equipo de trabajo para la materia **Desarrollo Backend**.

* Juan David Durán
* Alejo Ocampo
* Carlos Lema

---

# Licencia

Proyecto académico desarrollado con fines educativos.
