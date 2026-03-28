# Restricciones y Endpoints del Backend para el Frontend

Este documento detalla los endpoints, rutas requeridas, y las restricciones (constraints) de validación que el Frontend debe aplicar en sus formularios para interactuar correctamente con el Backend y no recibir errores de validación HTTP 400.

## 1. Módulo de Autenticación (`/auth`)
*Estos endpoints son públicos y no requieren token JWT.*

### 1.1 Registro de Usuario (`POST /auth/register`)
- **Payload ([RegisterRequest](file:///c:/Users/Juan%20Duran/Desktop/CodigosVarios/Portafolio/Desarrollo%20Backend-End/Sistema-Buses-Backend/ms_security/src/main/java/com/SBuses/demo/DTOs/RegisterRequest.java#6-42))**:
  - `name`: Requerido (No en blanco). Longitud permitida entre **2 y 50 caracteres**.
  - `lastName`: Requerido (No en blanco). Longitud permitida entre **2 y 50 caracteres**.
  - `email`: Requerido (No en blanco). Debe ser un formato de correo electrónico válido (e.g., test@test.com).
  - `password`: Requerido (No en blanco). **Mínimo 8 caracteres**. Debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (`@$!%*?&`).
  - `phone`: Requerido (No en blanco). Formato numérico válido (opcionalmente puede empezar con `+`, y tener entre **7 y 15 dígitos** en su totalidad).
  - `address`: Opcional. No puede superar los **200 caracteres**.
  - `recaptchaToken`: Requerido (No en blanco). Debe ser el token emitido por el reto de Google reCAPTCHA resuelto en el front-end.

### 1.2 Inicio de Sesión (`POST /auth/login`)
- **Payload ([LoginRequest](file:///c:/Users/Juan%20Duran/Desktop/CodigosVarios/Portafolio/Desarrollo%20Backend-End/Sistema-Buses-Backend/ms_security/src/main/java/com/SBuses/demo/DTOs/LoginRequest.java#7-20))**:
  - `email`: Requerido (No en blanco). Debe ser un formato válido.
  - `password`: Requerido (No en blanco).
  - `recaptchaToken`: Requerido (No en blanco). Token de validación anti-bots.

### 1.3 Envío de Código 2FA (`POST /auth/2fa/send`)
- **Payload (JSON simple)**:
  - `email`: String. Requerido.
  - `proposito`: String. Requerido. (Valores esperados por la lógica de negocio son `"REGISTRO"` o `"LOGIN"`).

### 1.4 Verificación de Código 2FA (`POST /auth/2fa/verify`)
- **Payload (JSON simple)**:
  - `email`: String. Requerido.
  - `codigo`: String. Requerido. Código OTP numérico recibido por correo.

### 1.5 Envío de Código de Recuperación (`POST /auth/recovery/send`)
- **Payload (JSON simple)**:
  - `email`: String. Requerido y no puede estar en blanco.

### 1.6 Verificación de Recuperación y Nueva Contraseña (`POST /auth/recovery/verify`)
- **Payload ([ResetPasswordRequest](file:///c:/Users/Juan%20Duran/Desktop/CodigosVarios/Portafolio/Desarrollo%20Backend-End/Sistema-Buses-Backend/ms_security/src/main/java/com/SBuses/demo/DTOs/ResetPasswordRequest.java#6-27))**:
  - `email`: Requerido (No en blanco). Formato de correo electrónico válido.
  - `codigo`: Requerido (No en blanco). Código OTP recibido para recuperación.
  - `newPassword`: Requerido. **Mínimo 8 caracteres**, al menos una mayúscula, una minúscula, un número y un carácter especial.
  - `recaptchaToken`: Requerido (No en blanco).

---

## 2. Módulo de Usuarios (`/api/users`)
*Requiere JWT Token en los Headers de la petición (`Authorization: Bearer <token>`)*

- **GET `/api/users`**: Obtiene lista completa de todos los usuarios.
- **GET `/api/users/{id}`**: Obtiene la información de un usuario dado su ID de Mongo.
- **GET `/api/users/email/{email}`**: Buscador de usuario por email.
- **POST `/api/users`**: Crea usuario (Administrador directamente). El `email` debe ser **único** (Constraint en BD).
- **PUT `/api/users/{id}`**: Actualiza datos de un usuario por ID.
- **DELETE `/api/users/{id}`**: Elimina a un usuario.
- **POST `/api/users/{id}/roles/{rolId}`**: Asigna un rol específico a un usuario.
- **DELETE `/api/users/{id}/roles/{rolId}`**: Remueve el rol específico asociado a un usuario.

---

## 3. Módulo de Roles (`/api/Role`)
*Requiere JWT Token en los Headers de la petición*

- **GET `/api/Role`**: Lista todos los roles existentes (ej. ADMIN, USER).
- **GET `/api/Role/{id}`**: Obtiene detalles de un rol específico.
- **POST `/api/Role`**: Crea rol nuevo. Payload requiere `name` (String, el rol debe poseer un nombre **único** a nivel esquema), `description`, `activo` (Boolean), y array de `permisos`.
- **PUT `/api/Role/{id}`**: Actualiza información de un rol.
- **DELETE `/api/Role/{id}`**: Elimina rol.
