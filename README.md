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

Ejecutar el Backend:

Asegúrate de tener la API de Flask (el backend) ejecutándose en una terminal separada.

Ejecutar el Frontend:
```
Bash

npm run dev
```
Abrir en el navegador:

Vite te indicará la URL en la terminal (usualmente http://localhost:5173).