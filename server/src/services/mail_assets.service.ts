import { promises as fs } from 'fs'
import { resolve } from 'path'
import { ASSETS_BASE_URL } from '../config'

const cache = new Map<string, string>()

function extToMime(ext: string) {
  const e = ext.toLowerCase()
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg'
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  if (e === '.avif') return 'image/avif'
  return 'application/octet-stream'
}

/**
 * Read an image from the client assets folder and return a data URI.
 * filename should be the file name inside client/src/assets/imagenes, e.g. 'alasSangre.jpg'
 */
export async function getAssetDataUri(filename: string) {
  if (!filename) return ''
  if (cache.has(filename)) return cache.get(filename) as string

  try {
    // If an ASSETS_BASE_URL is configured, prefer returning a public URL
    if (ASSETS_BASE_URL) {
      // ensure base has trailing slash
      const base = ASSETS_BASE_URL.endsWith('/') ? ASSETS_BASE_URL : `${ASSETS_BASE_URL}/`
      const url = `${base}${encodeURIComponent(filename)}`
      cache.set(filename, url)
      return url
    }
    // server process cwd is the server folder; go one level up to project root
    const imagePath = resolve(process.cwd(), '..', 'client', 'src', 'assets', 'imagenes', filename)
    const buf = await fs.readFile(imagePath)
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : ''
    const mime = extToMime(ext)
    const data = `data:${mime};base64,${buf.toString('base64')}`
    cache.set(filename, data)
    return data
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[mail_assets] failed to read asset', filename, err?.message || err)
    return ''
  }
}

export default getAssetDataUri

/**
 * Return an object with base64 content and mime type for attaching to emails.
 * If file can't be read, returns null.
 */
export async function getAssetBase64(filename: string): Promise<{ base64: string; mime: string; filename: string } | null> {
  if (!filename) return null
  try {
    const imagePath = resolve(process.cwd(), '..', 'client', 'src', 'assets', 'imagenes', filename)
    const buf = await fs.readFile(imagePath)
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : ''
    const mime = extToMime(ext)
    const base64 = buf.toString('base64')
    return { base64, mime, filename }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[mail_assets] failed to read asset for base64 attach', filename, err?.message || err)
    return null
  }
}
