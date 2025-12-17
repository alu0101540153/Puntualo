<div align="center">
  <img src="client/public/Logo_white.svg" alt="Puntualo Logo" width="400"/>
  
  # 🎬 Puntualo.com — Red Social Cultural
  
  ### _Comparte, descubre y conecta a través del entretenimiento_
  
  [![Node.js](https://img.shields.io/badge/Node.js-20.19.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  
</div>

---

## 📖 Descripción General

**Puntualo** es una plataforma social innovadora desarrollada por el **Equipo 20** de SYTW, diseñada para los amantes del entretenimiento cultural. Combina la pasión por libros, películas y series en un espacio interactivo donde los usuarios pueden compartir experiencias, descubrir nuevas obras y conectar con personas de gustos similares.

---

## 👥 Equipo de Desarrollo

<table>
  <tr>
    <td align="center">
      <img src="client/public/saray.png" width="100px" alt="Saray"/><br/>
      <b>Saray García Campos</b><br/>
      <i></i><br/>
      📧 alu0101544724@ull.edu.es
    </td>
    <td align="center">
      <img src="client/public/victor.png" width="100px" alt="Víctor"/><br/>
      <b>Víctor Rodríguez Dorta</b><br/>
      <i></i><br/>
      📧 alu0101540153@ull.edu.es
    </td>
    <td align="center">
      <img src="client/public/adrian.png" width="100px" alt="Adrián"/><br/>
      <b>Adrián León Díaz</b><br/>
      <i></i><br/>
      📧 alu0101495668@ull.edu.es
    </td>
  </tr>
</table>

---

## ✨ Funcionalidades Principales

### 🔐 Autenticación y Perfiles
- ✅ Registro e inicio de sesión seguro con JWT
- ✅ Autenticación con hash de contraseñas (Argon2)
- ✅ Perfiles de usuario personalizables
- ✅ Cuentas públicas y privadas
- ✅ Edición de perfil con color personalizado

### 👥 Sistema Social
- ✅ Seguir y dejar de seguir usuarios
- ✅ Sistema de solicitudes de seguimiento (estilo Instagram)
- ✅ Gestión de seguidores y seguidos
- ✅ Búsqueda de amigos con paginación
- ✅ Vista de amigos y sus actividades
- ✅ Contenido compartido entre amigos

### 🎬 Gestión de Contenido
- ✅ Catálogo de películas, series y libros
- ✅ Búsqueda avanzada por título y género
- ✅ Integración con TMDB API (películas y series)
- ✅ Integración con Google Books API
- ✅ Sistema de puntuación (1-10)
- ✅ Listas personalizadas:
  - 📺 **Viendo**: Contenido actual
  - ✅ **Visto**: Obras completadas
  - ⭐ **Wishlist**: Por ver/leer
  - 💯 **Puntuaciones**: Calificaciones personales

### 🤖 Inteligencia Artificial
- ✅ Sistema de recomendaciones inteligente

### 🔔 Notificaciones
- ✅ Sistema de notificaciones en tiempo real
- ✅ Notificaciones de solicitudes de seguimiento
- ✅ Notificaciones de aceptación/rechazo
- ✅ Contador de notificaciones no leídas
- ✅ Marcar como leídas

### 📊 Estadísticas y Análisis
- ✅ Top contenido mejor valorado
- ✅ Estadísticas globales de la plataforma
- ✅ Comparación de gustos con amigos
- ✅ Contenido común visto entre usuarios

### 🎨 Interfaz y UX
- ✅ Diseño responsive con Tailwind CSS
- ✅ Modo oscuro/claro
- ✅ Animaciones con GSAP
- ✅ Iconos de Heroicons
- ✅ Efectos 3D con Three.js
- ✅ Componentes UI reutilizables
- ✅ Modales interactivos de valoración

---

## 🛠️ Stack Tecnológico

### 🎯 Core Stack (MEVN)

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **MongoDB** | 6.x | Base de datos NoSQL con documentos JSON |
| **Express.js** | 4.18.2 | Framework backend para APIs REST |
| **Vue.js** | 3.5.22 | Framework frontend progresivo y reactivo |
| **Node.js** | 20.19.0+ | Entorno de ejecución JavaScript en servidor |

### 🎨 Frontend

#### Frameworks y Librerías
- **Vue Router** `4.6.3` - Enrutamiento SPA
- **Pinia** `3.0.3` - Gestión de estado global
- **TypeScript** `5.9.0` - Tipado estático
- **Vite** `7.2.0` - Build tool ultrarrápido
- **Tailwind CSS** `3.4.18` - Framework CSS utility-first
- **PostCSS** `8.5.6` - Procesamiento de CSS

#### Animaciones y UI
- **GSAP** `3.13.0` - Animaciones avanzadas
- **Three.js** `0.181.2` - Gráficos 3D y WebGL
- **Heroicons Vue** `2.2.0` - Iconos SVG optimizados

#### Testing
- **Vitest** `3.2.4` - Framework de testing unitario
- **Selenium WebDriver** `4.38.0` - Automatización de navegadores
- **@vitest/coverage-v8** - Cobertura de código

#### Dev Tools
- **ESLint** `9.37.0` - Linter de código
- **Prettier** `3.6.2` - Formateador de código
- **Vue DevTools** - Depuración y desarrollo

### ⚙️ Backend

#### Core
- **Express.js** `4.18.2` - Framework web
- **Mongoose** `6.9.2` - ODM para MongoDB
- **TypeScript** `5.3.3` - Tipado estático

#### Autenticación y Seguridad
- **jsonwebtoken** `9.0.2` - Tokens JWT
- **Argon2** `0.44.0` - Hash de contraseñas seguro
- **CORS** `2.8.5` - Control de acceso HTTP

#### Servicios Externos
- **Axios** `1.4.0` - Cliente HTTP

#### Utilidades
- **Morgan** `1.10.0` - Logger HTTP
- **dotenv** `16.0.3` - Variables de entorno

#### Testing
- **Vitest** `0.34.3` - Framework de testing
- **Supertest** `6.3.0` - Testing de APIs HTTP
- **MongoDB Memory Server** `8.12.1` - MongoDB en memoria para tests

#### Dev Tools
- **Nodemon** `2.0.20` - Auto-reinicio del servidor
- **ts-node** `10.9.1` - Ejecución de TypeScript
- **cross-env** `7.0.3` - Variables de entorno multiplataforma

### 🌐 APIs Externas

| Servicio | Propósito |
|----------|-----------|
| **TMDB API** | Catálogo de películas y series |
| **Google Books API** | Catálogo de libros |

### 🔧 DevOps y Herramientas

- **npm/pnpm** - Gestión de paquetes
- **Git** - Control de versiones
- **GitHub** - Repositorio y colaboración
- **Postman** - Testing de APIs
- **VS Code** - IDE principal

---

## 🚀 Instalación y Ejecución

### 📋 Requisitos Previos

- Node.js `20.19.0` o superior
- MongoDB `6.0` o superior
- npm o pnpm
- Git

### 📥 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone git@github.com:SyTW2526/Proyecto-E20.git
   cd Proyecto-E20
   ```

2. **Configurar variables de entorno**
   
   Crear archivo `.env` en la carpeta `server/`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/puntualo
   JWT_SECRET=tu_secreto_jwt_seguro
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   TMDB_API_KEY=tu_tmdb_key
   GOOGLE_BOOKS_API_KEY=tu_google_books_key
   REPLICATE_API_TOKEN=tu_replicate_token
   ```

### ⚙️ Backend

```bash
cd server
npm install
npm run dev        # Desarrollo con hot-reload
npm run build      # Build para producción
npm start          # Ejecutar build de producción
npm test           # Ejecutar tests
```

### 🎨 Frontend

```bash
cd client
npm install
npm run dev        # Desarrollo en http://localhost:5173
npm run build      # Build para producción
npm run preview    # Preview del build
npm run test:unit  # Tests unitarios
npm run test:e2e   # Tests E2E con Playwright
npm run test:coverage  # Cobertura de tests
npm run lint       # Linter
npm run format     # Formatear código
```

### 🚀 Ejecutar Todo el Proyecto

```bash
# Desde la raíz del proyecto
npm install
npm run start-all  # Inicia backend y frontend simultáneamente
```

---

## 📁 Estructura del Proyecto

```
Proyecto-E20/
├── client/                    # Aplicación Frontend (Vue.js)
│   ├── src/
│   │   ├── assets/           # Recursos estáticos
│   │   ├── components/       # Componentes Vue reutilizables
│   │   │   ├── dashboard/    # Componentes del dashboard
│   │   │   ├── home/         # Componentes de inicio
│   │   │   ├── profile/      # Componentes de perfil
│   │   │   └── ui/           # Componentes UI genéricos
│   │   ├── composables/      # Composables de Vue
│   │   ├── data/             # Datos estáticos
│   │   ├── router/           # Configuración de rutas
│   │   ├── services/         # Servicios de API
│   │   ├── stores/           # Estado global (Pinia)
│   │   ├── types/            # Tipos TypeScript
│   │   └── views/            # Vistas principales
│   ├── public/               # Recursos públicos (logos, imágenes)
│   ├── e2e/                  # Tests End-to-End
│   └── tests/                # Tests unitarios y Selenium
│
├── server/                    # Aplicación Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Configuraciones (DB, Cloudinary, etc.)
│   │   ├── controllers/      # Controladores de rutas
│   │   ├── database/         # Conexión a base de datos
│   │   ├── middlewares/      # Middlewares (auth, validación)
│   │   ├── models/           # Modelos de Mongoose
│   │   ├── routes/           # Definición de rutas API
│   │   ├── services/         # Lógica de negocio
│   │   └── __tests__/        # Tests unitarios
│   └── scripts/              # Scripts auxiliares
│
└── scripts/                   # Scripts de automatización
```

---

## 🧪 Testing

El proyecto cuenta con cobertura completa de tests:

### Frontend Tests

```bash
# Tests unitarios con Vitest
npm run test:unit

# Tests con cobertura
npm run test:coverage

# Tests E2E con Playwright
npm run test:e2e

# Tests con Selenium
npm run test:selenium
```

### Backend Tests

```bash
cd server
npm test
```

### Tecnologías de Testing

- **Vitest**: Tests unitarios rápidos y modernos
- **Playwright**: Testing E2E cross-browser
- **Selenium WebDriver**: Automatización de navegadores
- **Supertest**: Testing de APIs HTTP
- **MongoDB Memory Server**: Base de datos en memoria para tests

---

## 📡 API Endpoints

### 🔐 Autenticación
- `POST /api/v1/puntualo/auth/register` - Registrar usuario
- `POST /api/v1/puntualo/auth/login` - Iniciar sesión
- `GET /api/v1/puntualo/auth/me` - Obtener usuario actual

### 👤 Usuarios
- `GET /api/v1/puntualo/users` - Listar usuarios
- `GET /api/v1/puntualo/users/:id` - Obtener usuario por ID
- `PUT /api/v1/puntualo/users/:id` - Actualizar perfil
- `GET /api/v1/puntualo/users/:id/followers` - Obtener seguidores
- `GET /api/v1/puntualo/users/:id/following` - Obtener seguidos

### 🎬 Items (Películas, Series, Libros)
- `GET /api/v1/puntualo/items` - Listar items
- `GET /api/v1/puntualo/items/:id` - Obtener item por ID
- `POST /api/v1/puntualo/items` - Crear item
- `PUT /api/v1/puntualo/items/:id` - Actualizar item
- `DELETE /api/v1/puntualo/items/:id` - Eliminar item

### 🔍 Búsqueda
- `GET /api/v1/puntualo/search/movies?title=...` - Buscar películas (TMDB)
- `GET /api/v1/puntualo/search/series?title=...` - Buscar series (TMDB)
- `GET /api/v1/puntualo/search/books?title=...` - Buscar libros (Google Books)
- `GET /api/v1/puntualo/search/friends?name=...` - Buscar usuarios
- `POST /api/v1/puntualo/search/movies/:tmdbId` - Guardar película de TMDB
- `POST /api/v1/puntualo/search/series/:tmdbId` - Guardar serie de TMDB
- `POST /api/v1/puntualo/search/books/:googleId` - Guardar libro de Google Books

### 👥 Solicitudes de Seguimiento
- `POST /api/v1/puntualo/follow-requests` - Crear solicitud
- `GET /api/v1/puntualo/follow-requests/pending` - Solicitudes recibidas
- `GET /api/v1/puntualo/follow-requests/sent` - Solicitudes enviadas
- `PUT /api/v1/puntualo/follow-requests/:id/accept` - Aceptar solicitud
- `PUT /api/v1/puntualo/follow-requests/:id/reject` - Rechazar solicitud
- `DELETE /api/v1/puntualo/follow-requests/:id` - Cancelar solicitud

### 🔔 Notificaciones
- `GET /api/v1/puntualo/notifications` - Todas las notificaciones
- `GET /api/v1/puntualo/notifications/unread` - No leídas
- `GET /api/v1/puntualo/notifications/count` - Contar no leídas
- `PUT /api/v1/puntualo/notifications/:id/read` - Marcar como leída
- `PUT /api/v1/puntualo/notifications/mark-all-read` - Marcar todas como leídas
- `DELETE /api/v1/puntualo/notifications/:id` - Eliminar notificación

### 📊 Estadísticas
- `GET /api/v1/puntualo/stats` - Estadísticas generales
- `GET /api/v1/puntualo/stats/top-rated` - Top valoraciones
- `GET /api/v1/puntualo/stats/all` - Estadísticas combinadas

### 🤖 IA
- `POST /api/v1/puntualo/ai/chat` - Chat con IA
- `GET /api/v1/puntualo/ai/recommendations` - Obtener recomendaciones

---

## 🎨 Características de Diseño

### Responsive Design
- 📱 Mobile First
- 💻 Tablet y Desktop optimizados
- 🖥️ Diseño adaptativo fluido

### Temas
- 🌙 Modo oscuro completo
- ☀️ Modo claro
- 🎨 Persistencia de preferencias

### Animaciones
- ⚡ Transiciones suaves con GSAP
- 🎭 Efectos 3D con Three.js
- 🌊 Animaciones de scroll
- 💫 Micro-interacciones

### Accesibilidad
- ♿ Navegación por teclado
- 🔊 Etiquetas ARIA
- 👁️ Alto contraste
- 📖 Texto legible

---

## 🔒 Seguridad

- 🔐 **Autenticación JWT** - Tokens seguros con expiración
- 🔒 **Hash de contraseñas** - Argon2 (resistente a ataques)
- 🛡️ **CORS configurado** - Protección contra XSS
- 🚫 **Validación de entrada** - Sanitización de datos
- 🔑 **Variables de entorno** - Credenciales protegidas
- 📝 **Cuentas privadas** - Control de privacidad

---

## 📚 Documentación Adicional

- 📄 [Sistema de Notificaciones y Cuentas Privadas](NOTIFICACIONES_Y_CUENTAS_PRIVADAS.md)
- 🔍 [Colección de Postman](postman_search_pagination_collection.json)

---

---

## 📝 Licencia

Este proyecto es parte de un trabajo académico de la Universidad de La Laguna.

---

---

## 📧 Contacto

¿Tienes preguntas o sugerencias? Contáctanos:

- 📧 alu0101544724@ull.edu.es (Saray)
- 📧 alu0101540153@ull.edu.es (Víctor)
- 📧 alu0101495668@ull.edu.es (Adrián)

---

<div align="center">
  
  ### ⭐ Si te gustó el proyecto, dale una estrella!
  
  **Desarrollado con ❤️ **
  
  <img src="client/public/icon_logo.svg" alt="Puntualo Icon" width="100"/>
  
</div>
 






