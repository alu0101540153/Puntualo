import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { writeFileSync, unlinkSync } from 'fs'
import path from 'path'

const LOCAL_MODEL = (process.env.LOCAL_MODEL || 'false').toLowerCase() === 'true'
const LOCAL_MODEL_CLI = process.env.LOCAL_MODEL_CLI || ''

// Diagnostic logs to help debug local model invocation
console.log('AI service config - LOCAL_MODEL=', LOCAL_MODEL, 'LOCAL_MODEL_CLI=', LOCAL_MODEL_CLI)

// Ask a configured local model CLI. The CLI should accept a JSON payload on stdin
// and return a JSON object with { reply: '...' } on stdout.
export async function askLocalModel(messages: Array<{ role: string; content: string }>, extras: Record<string, any> | null = null) {
  if (!LOCAL_MODEL) throw new Error('LOCAL_MODEL not enabled')
  if (!LOCAL_MODEL_CLI) throw new Error('LOCAL_MODEL_CLI not configured')

  // Prepare temp file payload (safer for complex commands); some CLIs may accept stdin
  const payloadObj: Record<string, any> = { messages }
  if (extras && typeof extras === 'object') {
    // merge extras at top-level (e.g., { db_items: [...] })
    Object.assign(payloadObj, extras)
  }
  const payload = JSON.stringify(payloadObj)
  // Spawn the CLI command (split by spaces)
  const parts = LOCAL_MODEL_CLI.split(' ').filter(Boolean)
  const cmd = parts[0]
  const args = parts.slice(1)

  return new Promise<string | null>((resolve, reject) => {
    try {
      console.log('Spawning local model process:', cmd, args.join(' '))
      console.log('Local model payload size:', Buffer.byteLength(payload, 'utf8'), 'bytes')
      const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
      let out = ''
      let err = ''
      child.stdout.on('data', (d) => { const s = d.toString(); out += s; /* stream log minimal */ })
      child.stderr.on('data', (d) => { const s = d.toString(); err += s; console.error('Local model stderr chunk:', s) })
      child.on('error', (e) => {
        console.error('Local model spawn error:', e)
        return reject(e)
      })
      child.on('close', (code) => {
        console.log('Local model process closed with code:', code)
        if (err) console.error('Local model aggregated stderr:', err)
        // Try parse JSON reply
        try {
          const json = out ? JSON.parse(out) : null
          if (json && (json.reply || json.text)) {
            console.log('Local model returned JSON reply')
            resolve(json.reply || json.text)
            return
          }
        } catch (e) {
          console.error('Failed parsing local model JSON output:', (e as any)?.message || e)
          // not JSON, return raw if present
          if (out.trim()) {
            console.log('Local model returned raw text reply')
            return resolve(out.trim())
          }
        }
        // nothing usable
        console.warn('Local model returned no usable output')
        resolve(null)
      })
      // write payload to stdin (log truncated payload for safety)
      try {
        const preview = payload.length > 200 ? payload.slice(0,200) + '...[truncated]' : payload
        console.log('Writing payload to local model stdin (preview):', preview)
        child.stdin.write(payload)
        child.stdin.end()
      } catch (e) {
        console.error('Error writing to local model stdin:', e)
      }
    } catch (e) {
      reject(e)
    }
  })
}

// Local fallback used by controller when local model isn't available
export async function localFallbackReply(message: string) {
  // keep behavior consistent with client's fallback handler — return null to let controller build recommendations
  return null
}
