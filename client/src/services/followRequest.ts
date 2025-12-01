import api from './api'

export interface FollowRequest {
  _id: string
  from: {
    _id: string
    name: string
    handle: string
    avatarBgColor?: string
  }
  to: {
    _id: string
    name: string
    handle: string
    avatarBgColor?: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface FollowRequestResponse {
  message: string
  status: 'following' | 'requested'
  request?: FollowRequest
}

// Crear solicitud de seguimiento (o seguir directamente si es público)
export async function createFollowRequest(targetId: string): Promise<FollowRequestResponse> {
  return api.apiFetch('/follow-requests', {
    method: 'POST',
    body: { targetId },
    auth: true
  })
}

// Obtener solicitudes pendientes recibidas
export async function getPendingRequests(): Promise<FollowRequest[]> {
  return api.apiFetch('/follow-requests/pending', { auth: true })
}

// Obtener solicitudes enviadas
export async function getSentRequests(): Promise<FollowRequest[]> {
  return api.apiFetch('/follow-requests/sent', { auth: true })
}

// Verificar si existe una solicitud pendiente
export async function checkPendingRequest(targetId: string): Promise<{ hasPending: boolean }> {
  return api.apiFetch(`/follow-requests/check/${targetId}`, { auth: true })
}

// Aceptar una solicitud
export async function acceptFollowRequest(requestId: string) {
  return api.apiFetch(`/follow-requests/${requestId}/accept`, {
    method: 'PUT',
    auth: true
  })
}

// Rechazar una solicitud
export async function rejectFollowRequest(requestId: string) {
  return api.apiFetch(`/follow-requests/${requestId}/reject`, {
    method: 'PUT',
    auth: true
  })
}

// Cancelar una solicitud enviada
export async function cancelFollowRequest(requestId: string) {
  return api.apiFetch(`/follow-requests/${requestId}`, {
    method: 'DELETE',
    auth: true
  })
}

export default {
  createFollowRequest,
  getPendingRequests,
  getSentRequests,
  checkPendingRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest
}
