import { apiFetch } from './api'
import type { Ref } from 'vue'

export async function registerUser(payload: { name: string; handle: string; email: string; password: string }) {
  return apiFetch('/auth/register', { method: 'POST', body: payload })
}

export async function loginUser(payload: { email: string; password: string }) {
  return apiFetch('/auth/login', { method: 'POST', body: payload })
}

export function saveAuth(user: any, token: string) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function getUser(): any {
  const raw = localStorage.getItem('user')
  try {
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function getToken() {
  return localStorage.getItem('token')
}
