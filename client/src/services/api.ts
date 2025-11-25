// Por defecto usamos el puerto 5000 (server/.env tiene PORT=5000). Puedes sobreescribir con VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/puntualo'

type FetchOptions = {
  method?: string
  body?: any
  headers?: Record<string, string>
  auth?: boolean
}

function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = `${BASE_URL}${path}`
  // Si el body es FormData no establecemos Content-Type; el navegador lo pone correctamente
  const isFormData = options.body && typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  }

  if (options.auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      // si es FormData, no stringificamos
      body: options.body && isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
    })
  } catch (networkErr: any) {
    // Network error (server down, CORS blocked, wrong port...)
    throw new Error(`Network error: ${networkErr.message || networkErr}`)
  }

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (e) {
    // response no-json
    data = text
  }

  if (!res.ok) {
    // Throw a JSON string containing status and body so callers can parse reliably
    const errBody = data ?? res.statusText
    throw new Error(JSON.stringify({ status: res.status, body: errBody }))
  }

  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export default {
  apiFetch,
  logout
}
