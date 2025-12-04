#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const path = require('path');

function runSync(cmd, args, cwd) {
  console.log(`> Running: ${cmd} ${args.join(' ')} (cwd=${cwd})`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: true });
  if (r.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')} (cwd=${cwd})`)
    process.exit(r.status || 1)
  }
}

function runServer(cmd, args, cwd) {
  console.log(`> Starting server: ${cmd} ${args.join(' ')} (cwd=${cwd})`)
  const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
  p.on('close', (code) => {
    console.log(`Server process exited with code ${code}`)
    process.exit(code || 0)
  })
}

const root = path.resolve(__dirname, '..')
const clientDir = path.join(root, 'client')
const serverDir = path.join(root, 'server')

// Install and build client
runSync('npm', ['ci', '--include=dev'], clientDir)
runSync('npm', ['run', 'build'], clientDir)

// Install server deps
runSync('npm', ['ci', '--include=dev'], serverDir)

// Start server (this will keep the process alive)
runServer('npm', ['run', 'start'], serverDir)
