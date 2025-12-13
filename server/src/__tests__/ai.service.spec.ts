import { describe, it, expect, vi } from 'vitest'

// Ensure env flags off by default
process.env.LOCAL_MODEL = 'false'
process.env.LOCAL_MODEL_CLI = ''

// Fresh import per test where needed

describe('ai.service', () => {
  it('askLocalModel throws when LOCAL_MODEL disabled', async () => {
    const svc = await import('../services/ai.service')
    await expect(svc.askLocalModel([{ role: 'user', content: 'hola' }])).rejects.toThrow('LOCAL_MODEL not enabled')
  })

  it('askLocalModel throws when CLI missing', async () => {
    vi.resetModules()
    process.env.LOCAL_MODEL = 'true'
    process.env.LOCAL_MODEL_CLI = ''
    const svc = await import('../services/ai.service')
    await expect(svc.askLocalModel([{ role: 'user', content: 'hola' }])).rejects.toThrow('LOCAL_MODEL_CLI not configured')
  })

  it('localFallbackReply returns null', async () => {
    const svc = await import('../services/ai.service')
    const res = await svc.localFallbackReply('hola')
    expect(res).toBeNull()
  })

  it('askLocalModel returns JSON reply when CLI outputs JSON', async () => {
    vi.resetModules()
    process.env.LOCAL_MODEL = 'true'
    process.env.LOCAL_MODEL_CLI = 'mock-cli'
    // Mock spawn to emit a JSON payload
    vi.doMock('child_process', () => {
      const events: Record<string, Function> = {}
      const stdout = { on: (ev: string, cb: Function) => { if (ev === 'data') events['stdout'] = cb } }
      const stderr = { on: (ev: string, cb: Function) => { if (ev === 'data') events['stderr'] = cb } }
      const stdin = { write: (_d: any) => {}, end: () => {} }
      const child = {
        stdout, stderr, stdin,
        on: (ev: string, cb: Function) => { if (ev === 'error') events['error'] = cb; if (ev === 'close') events['close'] = cb },
      }
      // Immediately push JSON output then close
      setTimeout(() => {
        events['stdout']?.(Buffer.from(JSON.stringify({ reply: 'ok-json' })))
        events['close']?.(0)
      }, 0)
      return { spawn: () => child }
    })
    const svc = await import('../services/ai.service')
    const reply = await svc.askLocalModel([{ role: 'user', content: 'hola' }])
    expect(reply).toBe('ok-json')
  })

  it('askLocalModel returns raw text when CLI outputs text', async () => {
    vi.resetModules()
    process.env.LOCAL_MODEL = 'true'
    process.env.LOCAL_MODEL_CLI = 'mock-cli'
    // Mock spawn to emit plain text
    vi.doMock('child_process', () => {
      const events: Record<string, Function> = {}
      const stdout = { on: (ev: string, cb: Function) => { if (ev === 'data') events['stdout'] = cb } }
      const stderr = { on: (ev: string, cb: Function) => { if (ev === 'data') events['stderr'] = cb } }
      const stdin = { write: (_d: any) => {}, end: () => {} }
      const child = {
        stdout, stderr, stdin,
        on: (ev: string, cb: Function) => { if (ev === 'error') events['error'] = cb; if (ev === 'close') events['close'] = cb },
      }
      setTimeout(() => {
        events['stdout']?.(Buffer.from('hola texto'))
        events['close']?.(0)
      }, 0)
      return { spawn: () => child }
    })
    const svc = await import('../services/ai.service')
    const reply = await svc.askLocalModel([{ role: 'user', content: 'hola' }])
    expect(reply).toBe('hola texto')
  })
})
