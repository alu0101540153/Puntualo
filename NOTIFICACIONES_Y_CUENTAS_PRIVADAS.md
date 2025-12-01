# Sistema de Notificaciones y Cuentas Privadas - Puntualo

## Resumen de Cambios Implementados

Se ha implementado un sistema completo de seguimiento estilo Instagram con cuentas privadas/públicas, solicitudes de seguimiento y notificaciones.

## Cambios en el Backend

### 1. Modelos Actualizados

#### `user.model.ts`
- **Nuevos campos**:
  - `isPrivate: Boolean` - Indica si la cuenta es privada (default: false)
  - `followers: [ObjectId]` - Array de usuarios que te siguen
  - `following: [ObjectId]` - Array de usuarios que sigues
- **Campo eliminado**: `follows` (reemplazado por `followers` y `following`)

#### `followRequest.model.ts` (NUEVO)
- `from: ObjectId` - Usuario que envía la solicitud
- `to: ObjectId` - Usuario que recibe la solicitud
- `status: String` - Estado: 'pending', 'accepted', 'rejected'
- `createdAt: Date` - Fecha de creación

#### `notification.model.ts` (NUEVO)
- `recipient: ObjectId` - Usuario que recibe la notificación
- `sender: ObjectId` - Usuario que envía (opcional)
- `type: String` - Tipo: 'follow_request', 'follow_accepted', 'follow_rejected'
- `message: String` - Mensaje de la notificación
- `read: Boolean` - Si fue leída
- `relatedId: ObjectId` - ID de la solicitud relacionada
- `createdAt: Date` - Fecha de creación

### 2. Nuevos Servicios

#### `followRequest.service.ts`
- `create(fromId, toId)` - Crea solicitud o sigue directamente si es público
- `accept(requestId, userId)` - Acepta una solicitud
- `reject(requestId, userId)` - Rechaza una solicitud
- `cancel(requestId, userId)` - Cancela una solicitud enviada
- `getPendingRequests(userId)` - Obtiene solicitudes recibidas pendientes
- `getSentRequests(userId)` - Obtiene solicitudes enviadas pendientes
- `checkPendingRequest(fromId, toId)` - Verifica si existe solicitud pendiente

#### `notification.service.ts`
- `getAll(userId, unreadOnly)` - Obtiene todas las notificaciones
- `getUnread(userId)` - Obtiene solo no leídas
- `countUnread(userId)` - Cuenta notificaciones no leídas
- `markAsRead(notificationId, userId)` - Marca como leída
- `markAllAsRead(userId)` - Marca todas como leídas
- `delete(notificationId, userId)` - Elimina una notificación

#### Actualización en `user.service.ts`
- `getFollowers(userId)` - Obtiene seguidores
- `getFollowing(userId)` - Obtiene usuarios seguidos
- `followUser()` y `unfollowUser()` - Actualizados para usar `followers`/`following`

### 3. Nuevos Controladores y Rutas

#### Rutas de FollowRequest (`/api/v1/puntualo/follow-requests`)
- `POST /` - Crear solicitud
- `GET /pending` - Solicitudes recibidas
- `GET /sent` - Solicitudes enviadas
- `GET /check/:targetId` - Verificar solicitud pendiente
- `PUT /:id/accept` - Aceptar solicitud
- `PUT /:id/reject` - Rechazar solicitud
- `DELETE /:id` - Cancelar solicitud

#### Rutas de Notificaciones (`/api/v1/puntualo/notifications`)
- `GET /` - Todas las notificaciones
- `GET /unread` - Solo no leídas
- `GET /count` - Contar no leídas
- `PUT /:id/read` - Marcar como leída
- `PUT /mark-all-read` - Marcar todas como leídas
- `DELETE /:id` - Eliminar notificación

#### Rutas de Usuario Actualizadas
- `GET /users/:id/followers` - Obtener seguidores
- `GET /users/:id/following` - Obtener siguiendo

## Cambios en el Frontend

### 1. Nuevos Servicios

#### `followRequest.ts`
- Funciones para crear, aceptar, rechazar y cancelar solicitudes
- Verificar estado de solicitudes

#### `notification.ts`
- Gestión completa de notificaciones
- Contador de no leídas

#### `user.ts`
- `getFollowers(userId)` - Obtener seguidores
- `getFollowing(userId)` - Obtener siguiendo

### 2. Vistas Actualizadas

#### `NotificationsView.vue` (NUEVA)
- Lista de todas las notificaciones
- Botones para aceptar/rechazar solicitudes
- Ver perfil del solicitante
- Marcar como leídas
- Contador de no leídas

#### `MyFriendsView.vue` (ACTUALIZADA)
- Tabs separados para "Siguiendo" y "Seguidores"
- Lista completa con avatares
- Botón "Seguir de vuelta" para seguidores
- Botón "Dejar de seguir" para siguiendo

#### `ProfileView.vue` (ACTUALIZADA)
- Botón de seguir ahora muestra 3 estados:
  - **"Seguir"** - Si no sigues al usuario
  - **"Solicitado"** - Si enviaste una solicitud pendiente
  - **"Dejar de seguir"** - Si ya sigues al usuario
- Al hacer clic en "Solicitado", cancela la solicitud

### 3. Componentes Actualizados

#### `DashboardHeader.vue`
- Nuevo botón de notificaciones con campana
- Badge rojo con contador de notificaciones no leídas
- Actualización automática cada 30 segundos

#### `ProfileSidebar.vue`
- Botón de seguir actualizado para mostrar los 3 estados

### 4. Ruta Nueva
- `/notifications` - Vista de notificaciones

## Flujo de Funcionamiento

### Cuenta Pública (isPrivate = false)
1. Usuario A hace clic en "Seguir" en el perfil de Usuario B
2. Se añade automáticamente a `following` de A y `followers` de B
3. Botón cambia a "Dejar de seguir"

### Cuenta Privada (isPrivate = true)
1. Usuario A hace clic en "Seguir" en el perfil de Usuario B (privado)
2. Se crea una `FollowRequest` con estado `pending`
3. Se crea una `Notification` para Usuario B
4. Botón cambia a "Solicitado"
5. Usuario B recibe notificación y puede:
   - **Aceptar**: Se añade la relación follower/following y se notifica a A
   - **Rechazar**: Se rechaza la solicitud (no se notifica a A)
6. Usuario A puede cancelar la solicitud haciendo clic en "Solicitado"

### Gestión de Privacidad
Para cambiar una cuenta a privada, el usuario debe actualizar su perfil:
```typescript
// En EditProfileView.vue (necesitarás añadir el campo)
await updateUser(userId, { isPrivate: true })
```

## Migraciones Necesarias

Si ya tienes usuarios en la base de datos, debes migrar:

1. Renombrar `follows` a `following`:
```javascript
db.users.updateMany({}, {
  $rename: { "follows": "following" }
})
```

2. Añadir campos nuevos:
```javascript
db.users.updateMany({}, {
  $set: {
    isPrivate: false,
    followers: []
  }
})
```

3. Poblar `followers` basándose en `following`:
```javascript
db.users.find().forEach(user => {
  user.following.forEach(followedId => {
    db.users.updateOne(
      { _id: followedId },
      { $addToSet: { followers: user._id } }
    )
  })
})
```

## Próximas Mejoras Sugeridas

1. **Toggle de privacidad** en EditProfileView
2. **Restricciones de contenido** para cuentas privadas (no mostrar ratings si no te sigue)
3. **Notificaciones en tiempo real** con WebSockets
4. **Búsqueda de usuarios** mejorada mostrando si la cuenta es privada
5. **Email notifications** cuando llega una solicitud
6. **Límite de solicitudes** pendientes por usuario

## Testing

Para probar el sistema:

1. Crea 2 usuarios
2. Marca uno como privado actualizando en la BD: `{ isPrivate: true }`
3. Intenta seguir desde el otro usuario
4. Verifica que aparece "Solicitado"
5. Revisa las notificaciones
6. Acepta/rechaza la solicitud

## Archivos Modificados/Creados

### Backend
- ✅ `server/src/models/user.model.ts`
- ✅ `server/src/models/followRequest.model.ts` (nuevo)
- ✅ `server/src/models/notification.model.ts` (nuevo)
- ✅ `server/src/services/followRequest.service.ts` (nuevo)
- ✅ `server/src/services/notification.service.ts` (nuevo)
- ✅ `server/src/services/user.service.ts`
- ✅ `server/src/controllers/followRequest.controller.ts` (nuevo)
- ✅ `server/src/controllers/notification.controller.ts` (nuevo)
- ✅ `server/src/controllers/user.controller.ts`
- ✅ `server/src/routes/followRequest.route.ts` (nuevo)
- ✅ `server/src/routes/notification.route.ts` (nuevo)
- ✅ `server/src/routes/user.route.ts`
- ✅ `server/src/routes/index.ts`
- ✅ `server/src/server.ts`

### Frontend
- ✅ `client/src/services/followRequest.ts` (nuevo)
- ✅ `client/src/services/notification.ts` (nuevo)
- ✅ `client/src/services/user.ts`
- ✅ `client/src/views/NotificationsView.vue` (nuevo)
- ✅ `client/src/views/MyFriendsView.vue`
- ✅ `client/src/views/ProfileView.vue`
- ✅ `client/src/components/profile/ProfileSidebar.vue`
- ✅ `client/src/components/dashboard/DashboardHeader.vue`
- ✅ `client/src/router/index.ts`

---

**¡El sistema está completo y listo para usar!** 🎉
