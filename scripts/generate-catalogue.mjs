import fs from 'node:fs'
import { parse } from '@vue/compiler-dom'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import './generate-map-links.mjs'
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))
const catalogue = JSON.parse(fs.readFileSync('shared/catalogue.json', 'utf8'))
fs.writeFileSync('app/data/catalogue.json', JSON.stringify(catalogue, null, 2) + '\n')
const actions = JSON.parse(fs.readFileSync('shared/desktop-actions.json', 'utf8'))
const entries = []
const quests = JSON.parse(fs.readFileSync('app/data/quickQuests.json', 'utf8'))
const attr = (n, name) => n.props?.find(p => p.name === name)?.value?.content || ''
const text = (n, clean = false) => clean && /g-tag|g-chev/.test(attr(n, 'class')) ? '' : n.type === 2 ? n.content : (n.children || []).map(c => text(c, clean)).join('')
for (const map of catalogue.maps) {
  entries.push({ id: map.id, name: map.name, map: map.id, kind: 'Guide', route: map.route, keywords: 'bo7 zombies main quest easter egg' })
  const root = parse(fs.readFileSync(`app/components/guide/${map.id}.vue`, 'utf8'))
  const walk = (n, quick = false) => {
    quick ||= /\b(cheat-grid|quest-grid)\b/.test(attr(n, 'class'))
    if (/^h[123]$/.test(n.tag)) {
      const name = text(n, true).replace(/\s+/g, ' ').trim()
      const id = attr(n, 'id') || `${n.tag}-${text(n).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}`
      if (name && !quick && id !== 'wiki_main_quest_cheat_sheet') entries.push({ id: `${map.id}:${id}`, name, map: map.id, kind: 'Section', route: `${map.route}#${id}`, keywords: map.name })
    }
    n.children?.forEach(child => walk(child, quick))
  }
  walk(root)
  for (const phase of quests[map.id] || []) entries.push({ id:`${map.id}:quick-${phase.id}`, name:phase.title, map:map.id, kind:'Quick parts', route:`${map.route}#quick-${phase.id}`, keywords:map.name+' main quest checklist' })
}
for (const tool of catalogue.tools) entries.push({ ...tool, kind: 'Tool', keywords: `${catalogue.maps.find(m=>m.id===tool.map).name} solver tracker` })
entries.push({ id: 'super-ee', name: 'Super Easter Egg', map: '', kind: 'Quest', route: '/guides/bo7-super-easter-egg', keywords: 'super ee toys warden exfil' })
fs.writeFileSync('app/data/searchIndex.json', JSON.stringify(entries, null, 2) + '\n')
const nav = catalogue.maps.flatMap(m => [
  { id: m.id, map: m.id, kind: 'guide', section: m.name, label: 'Guide', url: m.route, accel: m.shortcut, icon: '◇' },
  ...catalogue.tools.filter(t=>t.map===m.id).map(t=>({ id:t.id, map:m.id, kind:'tool', section:m.name, label:t.name, url:t.route, accel:t.shortcut, icon:'↗' }))
])
fs.writeFileSync('desktop-app/renderer/nav.js', `// Generated from shared/catalogue.json; run node scripts/generate-catalogue.mjs.\nconst NAV = ${JSON.stringify(nav,null,2)}\nconst SYSTEM_ACTIONS = ${JSON.stringify(actions,null,2)}\nif (typeof window !== 'undefined') { window.NAV = NAV; window.SYSTEM_ACTIONS = SYSTEM_ACTIONS }\nif (typeof module !== 'undefined') { module.exports = NAV; module.exports.SYSTEM_ACTIONS = SYSTEM_ACTIONS }\n`)
console.log(`Generated ${entries.length} search entries and ${nav.length} desktop shortcuts.`)
const css = fs.readFileSync('app/assets/css/main.css', 'utf8')
fs.writeFileSync('desktop-app/renderer/themes.css', '/* Generated from the website theme tokens. */\n' + [...css.matchAll(/:root\[data-theme="[^"]+"\] \{[^}]+\}/g)].map(m=>m[0]).join('\n') + '\n')
