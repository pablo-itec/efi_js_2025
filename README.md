# efi_js_2025

E.F.I – Práctica Profesionalizante I (JavaScript)
Frontend (React)
Este repositorio contiene el código fuente del Frontend para el EFI de java script.

La aplicación está desarrollada en React (utilizando Vite) y consume una API REST de Flask. El objetivo es implementar un sistema de blog completo, incluyendo autenticación de usuarios basada en JWT, gestión de roles y operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para posteos y reseñas.

👥 Integrantes

Abataneo, Pablo: @pablo-itec

Cabrera, Ulises: @Ulicrack


🔗 Enlaces Requeridos
Enlace al Backend (API Flask): 

🛠️ Tecnologías Utilizadas
React 18: Para la construcción de la interfaz de usuario.

Vite: Como entorno de desarrollo y empaquetador (bundler).

React Context API (AuthContext): Para la gestión de estado global de autenticación y sesión de usuario.

Tailwind CSS (via CDN): Para un diseño moderno, responsivo y basado en utilidades. (Se utilizó el CDN debido a problemas persistentes con la instalación de npm en el entorno de desarrollo).

Lucide Icons (via CDN): Para la iconografía de la interfaz.

✨ Funcionalidades Implementadas
El proyecto cumple con los siguientes requisitos funcionales:

1. Autenticación y Usuarios
Formulario de Registro (nombre, email, password, rol).

Formulario de Login que obtiene un JWT de la API y lo almacena en localStorage.

Decodificación de token para obtener los datos del usuario (ID, email, rol, username).

Gestión de sesión de usuario mediante un contexto global (AuthContext).

Funcionalidad de Logout que limpia el estado y el localStorage.

2. CRUDs (Posts y Reviews)
Módulo de Posts: CRUD completo.

Listado público de posts.

Creación de nuevos posts (ruta protegida).

Edición de posts (solo por el autor o admin).

Eliminación de posts (solo por el autor o admin).

Módulo de Reviews (Comentarios):

Listado de comentarios en la vista detallada de un post.

Creación de nuevos comentarios (ruta protegida).

Eliminación de comentarios (solo por el autor, admin o moderador).

(Funcionalidad pendiente: Edición de comentarios)

3. Seguridad y Roles
Rutas Protegidas: Implementación de un componente ProtectedRoute que restringe el acceso basado en la autenticación.

Gestión de Roles (UI):

La UI se adapta según el rol del usuario (ej. admin, user).

Un Usuario (user) solo puede gestionar (editar/eliminar) sus propios posts y comentarios.

Un Administrador (admin) puede acceder al Panel de Administración, ver estadísticas, gestionar usuarios y eliminar cualquier post o comentario.

4. Interfaz de Usuario
Diseño limpio, moderno y responsivo (móvil y escritorio).

Uso de Toasts (notificaciones) para feedback de éxito o error en las operaciones.

Formularios con validaciones básicas.

Barra de navegación (Navbar) condicional que muestra diferentes enlaces según si el usuario está autenticado y su rol.

🚀 Guía de Instalación y Ejecución
Sigue estos pasos para ejecutar el proyecto en tu máquina local.

Clonar el repositorio:
```
Bash

git clone https://github.com/pablo-itec/efi_js_2025
```
Navegar a la carpeta: /efi_js_2025
```
Bash

cd efi_js_2025
```
Instalar dependencias: (Se asume que tienes Node.js y npm instalados, si no los tenes, instalalos).
```
Bash

npm install
```
(Nota: tailwindcss y lucide-react no se instalarán localmente, ya que se cargan por CDN en index.html).

Configurar la API:

El proyecto está configurado por defecto para conectarse al backend en http://127.0.0.1:5000.

Si tu backend corre en una URL o puerto diferente, modifica la constante API_URL en el archivo src/App.jsx.

Setear la contraseña de la bd en "mysql+pymysql://root:shurta@localhost/py_efi2_db" lin48

Ejecutar el Backend:

Asegúrate de tener la API de Flask (el backend) ejecutándose en una terminal separada.

Ejecutar el Frontend:
```
Bash

npm run dev
```
Abrir en el navegador:

Vite te indicará la URL en la terminal (usualmente http://localhost:5173).



IMPORTANTE

si hay algun error probablemente sea la vercion de bcrypt para solucionarlo 
```
BASH

pip uninstall bcrypt -y
pip install bcrypt==4.1.2

```
📂 Arquitectura y Estructura del Proyecto
se realizó una refactorización completa del frontend, pasando de una estructura monolítica a una arquitectura modular basada en la Separación de Responsabilidades.

El código fuente se organiza de la siguiente manera:

Plaintext
```
src/
├── components/       # componentes UI reutilizables y aislados
├── context/          # estado global 
├── pages/            # vistas principales 
└── App.jsx           # definición de Layout
```

Módulos:
src/context/:

Contiene el AuthContext.jsx. ---- conexión con la API, manejo de tokens JWT, persistencia de sesión en localStorage y gestión de estados de carga/error.

src/components/:

Almacena piezas de interfaz independientes que se utilizan a través de toda la aplicación, como la barra de navegación (Navbar), las notificaciones emergentes (Notification/Toasts) y el componente de seguridad de rutas (ProtectedRoute).

src/pages/ (Vistas):

Cada archivo aquí representa una "pantalla" o ruta específica de la aplicación (ej. LoginPage, AdminPage, PostDetailPage). Esto permite ubicar rápidamente errores visuales y mantiene limpia la lógica de ruteo.

src/App.jsx :

Su única responsabilidad es configurar el proveedor de contexto (AuthProvider), definir la estructura visual base (MainLayout) y gestionar el ruteo condicional entre las páginas.

---
# FEAT & FIX: Estabilidad, UX y Permisos. Resuelve CORS/308 y aplica Soft Delete

## 🚀 Resumen de Cambios y Mejoras del Proyecto

Este conjunto de modificaciones se enfoca en resolver errores críticos de comunicación (CORS, 308), la estabilidad de la aplicación (bucle infinito en React), y la implementación de requisitos clave como la visualización condicional de datos (Soft Delete) y la corrección de zonas horarias.

## I. 🛠️ Estabilidad y Comunicación (React / Flask)

### Archivo(s) Modificado(s)
```
1. AuthContext.jsx (Frontend)
2. app.py (Backend)
3. models.py (Backend)
```
### Descripción del Cambio
```
1. Se envolvieron todas las funciones expuestas (apiFetch, login, logout, showNotification, MapsTo) en useCallback para garantizar su estabilidad en los renders.
2. Se configuró explícitamente flask-cors para permitir las credenciales (supports_credentials=True) y orígenes específicos del frontend.
3. Se importó pytz y se cambió el valor por defecto (default) de las columnas date_time en Post y Comment para usar la hora local de Argentina (America/Argentina/Buenos_Aires).
```
### Resultado en la Página
```
1. Solución al Bucle Infinito: Se eliminó la inestabilidad del frontend, resolviendo el bloqueo de la aplicación que ocurría con errores de red o el rol "Moderador".
2. Solución al Error CORS: Se resolvió el bloqueo de solicitudes de red por el navegador, permitiendo la comunicación exitosa de la API con el token JWT.
3. Corrección de Zona Horaria: Los nuevos posts y comentarios ahora muestran la hora local correcta (GMT-3) en lugar de la hora UTC desfasada.

```
## II. 🔗 Corrección de Rutas (Error 308)

El error 308 Permanent Redirect causaba la mayoría de los fallos de carga en las secciones protegidas. Se resolvió aplicando la doble definición de ruta (/ruta y /ruta/) en el backend de Flask.

### Archivo(s) Modificado(s) y Rutas Corregidas
```
1. post_views.py: GET/POST/PUT/DELETE /posts y /posts/<id>.
2. categories_views.py: GET /categories.
3. user_view.py: GET /users y PATCH /users/<id>/role.
4. comments_views.py: GET/POST /posts/<id>/comments.

```
### Resultado en la Página
```
1.PostsListPage y PostFormPage: Se resolvió el bloqueo total de la aplicación al cargar la lista y al intentar crear/editar un post.
2. AdminPage: Se resolvió el error CORS y el administrador ya puede acceder al panel y cambiar roles sin fallos.
3. Navegación Estable: Se garantiza que todas las peticiones clave del frontend sean aceptadas por Flask sin redirecciones, lo cual es vital en un contexto CORS.

```
## III. ✨ Funcionalidad y Experiencia de Usuario (UX)

### Archivo(s) Modificado(s)
```
1. RegisterPage.jsx
2. PostFormPage.jsx
3. schemas.py
4. PostsListPage.jsx
5. PostDetailPage.jsx
```
### Descripción del Cambio
```
1. Se añadió la opción "Moderador" al formulario de registro.
2. Se implementó la lógica de redirección (MapsTo) al ID del post recién creado (newPost.id).
3. Se corrigió la serialización en schemas.py para mapear la relación user a la clave autor.
4. Se implementó la lógica de filtrado y estilo condicional (is_active en PostsListPage.jsx).
5. Se ajustaron las condiciones canEditPost y canDeleteComment para incluir el rol moderator.
6. Se añadieron llamadas a new Date(item.date_time).toLocaleString() para mostrar la fecha.
```
### Resultado en la Página
```
1. Registro de Roles: Los usuarios pueden registrarse con los tres niveles de permisos disponibles.
2. Creación de Post Exitosa: Después de hacer clic en "Publicar Post", el usuario es notificado y redirigido a la página de detalle.
3. Adiós, Anónimo: Ahora se muestra correctamente el nombre de usuario del autor en posts y comentarios.
4. Borrado Lógico (Soft Delete): Los usuarios comunes ya no ven posts borrados. Administradores/Moderadores los ven con estilo tachado (rojo pálido).
5. Permisos Refinados: Moderadores ahora tienen la capacidad de editar/eliminar cualquier post y comentario, reflejando la lógica del backend.
6. Visualización de Tiempo: Se muestra la fecha y hora de creación para posts y comentarios, con la hora correcta de Argentina.
