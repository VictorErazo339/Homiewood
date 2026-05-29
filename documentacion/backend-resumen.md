# Backend Homiwood

Backend de Homiwood, una red social para crear, compartir y comparar listas de películas, series y anime.

## Tecnologías

- Java 21
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Spring Security
- JWT
- BCrypt
- Jakarta Validation
- TMDB API
- Jikan API

---

## Arquitectura general

```mermaid
flowchart TD
    A[Frontend] -->|HTTP / JSON| B[Spring Boot Backend]
    B --> C[Controllers]
    C --> D[Services]
    D --> E[Repositories]
    E --> F[(PostgreSQL)]

    D --> G[TMDB API]
    D --> H[Jikan API]

    B --> I[Spring Security + JWT]
```

---

## Capas del backend

```text
controller/   Recibe peticiones HTTP
service/      Contiene lógica de negocio
repository/   Acceso a base de datos
model/        Entidades JPA
dto/          Requests y responses
exception/    Manejo global de errores
mapper/       Conversión de entidades a DTOs
security/     Filtros JWT
config/       CORS y seguridad
```

---

## Módulos implementados

| Módulo | Estado | Descripción |
|---|---:|---|
| Usuarios | Hecho | Registro, listado, búsqueda y eliminación |
| Autenticación | Hecho | Login, registro, JWT y BCrypt |
| Listas | Hecho | Creación y consulta de listas |
| Contenido | Hecho | Películas, series y anime |
| Géneros | Hecho | Administración de géneros |
| Contenido por lista | Hecho | Agregar contenido a listas |
| Calificaciones | Hecho | Puntajes y comentarios sobre contenido |
| Likes | Hecho | Likes a listas |
| Seguimientos | Hecho | Seguir y dejar de seguir usuarios |
| Grupos | Hecho | Crear grupos y agregar miembros |
| Comentarios | Hecho | Comentarios en listas |
| Recomendaciones | Hecho | Recomendaciones por usuario y grupo |
| Comparaciones | Hecho | Comparar usuarios y grupos |
| TMDB API | Hecho | Buscar películas y series |
| Jikan API | Hecho | Buscar anime |

---

## Flujo de autenticación

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL

    F->>B: POST /api/auth/register
    B->>B: Encripta contraseña con BCrypt
    B->>DB: Guarda usuario
    B->>B: Genera JWT
    B-->>F: Token + UsuarioResponse

    F->>B: GET /api/auth/me con Authorization Bearer
    B->>B: Valida JWT
    B->>DB: Busca usuario autenticado
    B-->>F: UsuarioResponse
```

---

## Seguridad

El backend usa JWT para proteger rutas privadas.

### Rutas públicas

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/health
GET  /api/catalogo/tmdb
GET  /api/catalogo/anime
GET  /api/catalogo/buscar
```

### Rutas protegidas

Todas las demás rutas requieren:

```http
Authorization: Bearer TOKEN
```

---

## Endpoints autenticados `/api/me`

Estos endpoints usan el usuario desde el JWT, por lo tanto el frontend no necesita mandar `idUsuario`.

```http
GET  /api/auth/me

GET  /api/me/listas
POST /api/me/listas

POST /api/me/listas/{idLista}/comentarios
GET  /api/me/comentarios

POST   /api/me/listas/{idLista}/likes
DELETE /api/me/listas/{idLista}/likes
GET    /api/me/likes

POST   /api/me/siguiendo/{idSeguido}
DELETE /api/me/siguiendo/{idSeguido}
GET    /api/me/siguiendo
GET    /api/me/seguidores

POST /api/me/grupos
GET  /api/me/grupos
```

---

## Modelo general de datos

```mermaid
erDiagram
    USUARIOS ||--o{ LISTAS : crea
    USUARIOS ||--o{ CALIFICACIONES : realiza
    USUARIOS ||--o{ LIKES_LISTA : da
    USUARIOS ||--o{ COMENTARIOS_LISTA : escribe
    USUARIOS ||--o{ SEGUIMIENTOS : seguidor
    USUARIOS ||--o{ GRUPO_MIEMBROS : pertenece

    LISTAS ||--o{ LISTA_CONTENIDO : contiene
    LISTAS ||--o{ LIKES_LISTA : recibe
    LISTAS ||--o{ COMENTARIOS_LISTA : recibe

    CONTENIDO ||--o{ LISTA_CONTENIDO : aparece
    CONTENIDO ||--o{ CALIFICACIONES : recibe
    CONTENIDO ||--o{ CONTENIDO_GENEROS : clasificado

    GENEROS ||--o{ CONTENIDO_GENEROS : agrupa

    GRUPOS ||--o{ GRUPO_MIEMBROS : tiene
```

---

## Flujo principal del MVP

```mermaid
flowchart LR
    A[Usuario se registra] --> B[Login]
    B --> C[Obtiene JWT]
    C --> D[Crea lista]
    D --> E[Busca contenido en TMDB/Jikan]
    E --> F[Agrega contenido a lista]
    F --> G[Otros usuarios dan like o comentan]
    G --> H[Usuarios crean grupos]
    H --> I[Backend genera recomendaciones]
    I --> J[Usuarios comparan listas]
```

---

## Validaciones

Se usan validaciones con Jakarta Validation:

- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Size`
- `@Pattern`
- `@Min`
- `@Max`
- `@Positive`
- `@PositiveOrZero`

Los errores se devuelven desde `GlobalExceptionHandler`.

Ejemplo de error:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Error de validación en los datos enviados.",
  "validationErrors": {
    "username": "El username debe tener entre 3 y 50 caracteres",
    "email": "El email debe tener un formato válido"
  }
}
```

---

## Respuestas limpias con DTOs

El backend no debe devolver entidades completas directamente.

Se usan DTOs como:

```text
UsuarioResponse
ListaResponse
ContenidoResponse
ComentarioListaResponse
GrupoResponse
LikeListaResponse
SeguimientoResponse
```

Esto evita exponer datos sensibles como:

```text
passwordHash
```

---

## Variables de entorno necesarias

En local se deben configurar:

```text
DB_PASSWORD
TMDB_TOKEN
JWT_SECRET
```

Ejemplo en IntelliJ:

```text
TMDB_TOKEN=token_real;DB_PASSWORD=password_postgres;JWT_SECRET=clave_larga_segura
```

---

## Pendiente importante

### Permisos de dueño

Aunque las rutas están protegidas con JWT, falta reforzar permisos específicos.

Ejemplos:

- Solo el dueño de una lista debería poder eliminarla.
- Solo el autor de un comentario debería poder editarlo o borrarlo.
- Solo el admin de un grupo debería poder eliminar miembros.
- Solo el dueño de una lista debería poder agregar o eliminar contenido de esa lista.

### Endpoints `/api/me` faltantes

Falta mejorar:

```http
PUT    /api/me/listas/{idLista}
DELETE /api/me/listas/{idLista}
POST   /api/me/listas/{idLista}/contenidos/externo
DELETE /api/me/listas/{idLista}/contenidos/{idListaContenido}
PUT    /api/me/comentarios/{idComentario}
DELETE /api/me/comentarios/{idComentario}
```

### Documentación de endpoints

Falta completar:

```text
docs/endpoints.md
```

con ejemplos de request y response.

