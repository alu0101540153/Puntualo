// Suite placeholder para omitir Selenium en Vitest sin ejecutar Selenium real
(async () => {
  try {
    const { describe, it } = await import('vitest')
    describe.skip('selenium login (skipped)', () => {
      it('skipped', () => {})
    })
  } catch (e) {
    // ignore if vitest is not available in this context
  }
})()
