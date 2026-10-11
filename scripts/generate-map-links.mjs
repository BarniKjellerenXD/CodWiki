import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const directory = path.join(root, 'app/data/maps')
const links = {}
if (fs.existsSync(directory)) {
  for (const file of fs.readdirSync(directory).filter(file => /^[a-z0-9-]+\.json$/.test(file)).sort()) {
    const map = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))
    links[map.id] = map.quickLinks || {}
    for (const [guideId, bindings] of Object.entries(map.guideQuickLinks || {})) {
      if (links[guideId]) throw new Error(`Duplicate quick map bindings: ${guideId}`)
      links[guideId] = bindings
    }
  }
}
fs.writeFileSync(path.join(root, 'app/data/mapQuickLinks.json'), JSON.stringify(links, null, 2) + '\n')
