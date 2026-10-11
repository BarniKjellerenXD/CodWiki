// Optional production verification in a fresh local directory when a cloud-sync
// client renames Nuxt's temporary cache. Normal project configuration is retained.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runCommand } from '@nuxt/cli'

const project = fileURLToPath(new URL('../', import.meta.url))
const supplied = process.argv[2]
if (!supplied || !path.isAbsolute(supplied)) throw new Error('Supply an absolute, empty local preview directory.')
const destination = path.resolve(supplied)
if (destination === path.parse(destination).root || destination === path.resolve(project)) throw new Error('Preview directory must be a dedicated child directory.')
if (fs.existsSync(destination) && fs.readdirSync(destination).length) throw new Error('Use a fresh empty preview directory; existing files are never cleared.')
fs.mkdirSync(destination, { recursive: true })
// Generated Tailwind/ESM files resolve packages through their parent directory.
// A junction keeps the existing installed dependencies available without a copy.
fs.symlinkSync(path.join(project, 'node_modules'), path.join(destination, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
const buildDir = path.resolve(destination, 'nuxt')
const outputDir = path.resolve(destination, 'output')
for (const target of [buildDir, outputDir]) {
  const relative = path.relative(destination, target)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Invalid generated build path.')
}
fs.writeFileSync(path.join(destination, 'source.json'), JSON.stringify({ project, buildDir, outputDir }, null, 2))
console.log(`Temporary build: ${buildDir}\nProduction output: ${outputDir}`)
await runCommand('build', ['--cwd', project], { overrides: { buildDir, nitro: { preset: 'node-server', output: { dir: outputDir } } } })
