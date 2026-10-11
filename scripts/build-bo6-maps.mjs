/**
 * Reproducible BO6 import from the pinned, MIT-licensed DECLASSIFIED snapshots.
 * Source TSX is parsed as syntax/data; no downloaded module is evaluated.
 * Run from the repository root: node scripts/build-bo6-maps.mjs [--inspect]
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'
import { bo6Guides } from '../shared/bo6-guides.mjs'

const root = process.cwd()
const revision = 'e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0'
const repo = 'https://github.com/Miss-placed/DECLASSIFIED'
const research = path.join(root, 'docs/map-expansion-research')
const snapshot = path.join(research, 'assets/bo6-source')
const vectors = path.join(research, 'assets/declassified')
const sourceLink = (file, line) => `${repo}/blob/${revision}/${file}${line ? '#L' + line : ''}`
const writeFile = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== value) fs.writeFileSync(file, value) }
const writeJson = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n')
const read = (base, file) => fs.readFileSync(path.join(base, file), 'utf8')
const parseFile = (base, file) => parse(read(base, file), { sourceType: 'module', plugins: ['typescript', 'jsx'] })
const declarations = tree => Object.fromEntries(tree.program.body.flatMap(n => (n.declaration || n).declarations || []).map(n => [n.id.name, n.init]))
const propName = n => n.name ?? n.value
const refName = n => n.type === 'MemberExpression' ? `${refName(n.object)}.${propName(n.property)}` : n.name
const getProp = (object, name) => object.properties.find(p => propName(p.key) === name)?.value
const literal = n => {
  if (!n) return undefined
  if (['StringLiteral', 'NumericLiteral', 'BooleanLiteral', 'NullLiteral'].includes(n.type)) return n.value ?? null
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return n.quasis.map(q => q.value.cooked).join('')
  if (n.type === 'UnaryExpression' && n.operator === '-') return -literal(n.argument)
  if (n.type === 'ArrayExpression') return n.elements.map(literal)
  if (n.type === 'ObjectExpression') return Object.fromEntries(n.properties.map(p => [propName(p.key), literal(p.value)]))
  throw new Error(`Unsupported literal syntax ${n.type} at ${n.loc?.start.line}`)
}

const specs = [
  { id: 'bo6-liberty-falls', name: 'Liberty Falls', layers: [['overview', 'Town', 'libertyFalls', 'libertyFalls']] },
  { id: 'bo6-terminus', name: 'Terminus', layers: [['prison', 'Prison', 'terminus_prison', 'terminusPrison'], ['biolab-islands', 'Bio Lab & islands', 'terminus_biolab', 'terminusBiolabs']] },
  { id: 'bo6-citadelle-des-morts', name: 'Citadelle des Morts', layers: [['overview', 'Castle & village', 'citadelle', 'citadelle']] },
  { id: 'bo6-the-tomb', name: 'The Tomb', layers: [['overview', 'Excavation & Dark Aether', 'tomb', 'tomb']] },
  { id: 'bo6-shattered-veil', name: 'Shattered Veil', layers: [['overview', 'Mansion & underground', 'shatteredVeil', 'shatteredVeil']] },
  { id: 'bo6-reckoning', name: 'Reckoning', layers: [['overview', 'Towers 1 & 2', 'reckoning', 'reckoning'], ['boss-arena', 'Tower 3 · boss atlas', 'reckoningBossArena', 'reckoningBossArena']] },
]
const mapNames = new Set(specs.flatMap(s => s.layers.map(l => l[3])))
const stores = { misc: 'MiscStore', perks: 'PerkStore', wallbuys: 'WallbuyStore', doors: 'DoorStore', mainQuest: 'StaticQuestStore', easterEggs: 'StaticEggStore' }
const typeAst = declarations(parseFile(snapshot, 'src/data/types.tsx')).MiscTypes
const perkAst = declarations(parseFile(snapshot, 'src/data/perks.tsx')).Perks
const records = []
for (const [file, storeName] of Object.entries(stores)) {
  const sourceFile = `src/data/${file}.tsx`
  const defs = declarations(parseFile(snapshot, sourceFile))
  for (const property of defs[storeName].properties) {
    let map = propName(property.key.property)
    if (map === 'terminusIslands') map = 'terminusBiolabs'
    if (!mapNames.has(map)) continue
    for (const marker of property.value.elements) {
      assert.equal(marker.type, 'NewExpression')
      assert.equal(marker.callee.name, 'MiscMarker')
      const [idNode, typeNode, locNode, options] = marker.arguments
      const typeRef = refName(typeNode)
      const typeKey = propName(typeNode.property)
      const dictionary = typeNode.object.name === 'MiscTypes' ? typeAst : typeNode.object.name === 'Perks' ? perkAst : defs.markers
      const definition = getProp(dictionary, typeKey)
      const item = definition.type === 'NewExpression' ? definition.arguments[0] : definition
      const title = literal(options && getProp(options, 'uniqueTitle')) || literal(getProp(item, 'title'))
      const desc = [literal(getProp(item, 'desc')), literal(options && getProp(options, 'uniqueDesc'))].filter(Boolean).join('\n')
      const loc = locNode.type === 'MemberExpression' && refName(locNode) === 'DefaultPOIData.nullLoc' ? null : literal(locNode)
      records.push({ map, id: literal(idNode), label: title, description: desc, loc, typeRef, group: file, sourceFile, line: marker.loc.start.line })
    }
  }
}
writeJson(path.join(snapshot, 'extracted-locations.json'), records)

// The SVGOverlay uses exactly this square in Leaflet CRS.Simple. Keep its native
// 512-unit viewBox: the viewer normalizes coordinates independently of resolution.
const globalStyleNode = declarations(parseFile(vectors, 'src/data/maps/sharedSVGProperties.tsx')).globalStyle
const globalStyle = literal(globalStyleNode)
const svgDefs = declarations(parseFile(vectors, 'src/data/maps/blackOps6Maps.tsx')).blackOps6Maps
const escapeXml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const allowedTags = new Set(['defs', 'style', 'pattern', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'clipPath', 'mask', 'text', 'tspan', 'use', 'linearGradient', 'radialGradient', 'stop'])
const exactAttrs = new Set(['viewBox', 'patternUnits', 'patternContentUnits', 'patternTransform', 'gradientUnits', 'gradientTransform', 'maskUnits', 'maskContentUnits', 'preserveAspectRatio', 'textLength', 'lengthAdjust'])
function svgValue(n) {
  if (n.type === 'JSXExpressionContainer') {
    if (n.expression.type === 'Identifier' && n.expression.name === 'globalStyle') return globalStyle
    if (n.expression.type === 'JSXEmptyExpression') return ''
    return literal(n.expression)
  }
  return literal(n)
}
function xml(n) {
  if (n.type === 'JSXText') return escapeXml(n.value)
  if (n.type === 'JSXExpressionContainer') return escapeXml(svgValue(n))
  assert.equal(n.type, 'JSXElement')
  const name = n.openingElement.name.name
  assert.ok(allowedTags.has(name), `Unreviewed SVG tag ${name}`)
  const attrs = n.openingElement.attributes.map(a => {
    assert.equal(a.type, 'JSXAttribute')
    let key = a.name.name
    assert.ok(!key.startsWith('on'), `Event attribute ${key}`)
    const value = a.value ? svgValue(a.value) : true
    if (key === 'style') return `style="${escapeXml(Object.entries(value).map(([k, v]) => `${k.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}:${v}`).join(';'))}"`
    if (key === 'className') key = 'class'
    else if (key === 'xlinkHref') key = 'href'
    else if (!exactAttrs.has(key)) key = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
    assert.ok(!['href', 'xlink-href'].includes(key) || String(value).startsWith('#'), 'External SVG reference')
    return `${key}="${escapeXml(value)}"`
  }).join(' ')
  return `<${name}${attrs ? ' ' + attrs : ''}>${n.children.map(xml).join('')}</${name}>`
}
const palette = ':root{--svg-border:#cf7775;--svg-roads:#29343f;--svg-background:#1e2630;--svg-field:#929eac;--svg-features:#596574;--svg-buildings:#c2ccd8;}'
const manifest = { repository: repo, revision, license: 'MIT', conversion: 'Static AST extraction; SVG geometry/framing unchanged. loc [lat,lng] → x=lng/512, y=1-lat/512.', files: [] }
for (const spec of specs) {
  const dir = path.join(root, 'public/maps', spec.id)
  fs.mkdirSync(dir, { recursive: true })
  writeFile(path.join(dir, 'LICENSE.txt'), read(vectors, 'LICENSE'))
  for (const [layer, label, svgKey] of spec.layers) {
    const overlay = getProp(svgDefs, svgKey)
    const body = overlay.children.map(xml).join('').replaceAll('strokeWidth:', 'stroke-width:').replaceAll('strokeMiterlimit:', 'stroke-miterlimit:').replaceAll('.cls-4, {', '.cls-4 {').replace(/#(?:555555|565555|565656)\b/gi, '#929eac').replace(/#6b6b6b\b/gi, '#596574').replace(/#7c2728\b/gi, '#cf7775').replaceAll('#363635', '#29343f').replaceAll('#2c2c2c', '#35414d').replaceAll('#7b4848', '#8b6369')
    const overlayAttrs = literal(overlay.openingElement.attributes.find(a => a.name.name === 'attributes').value.expression)
    const svg = `<!-- DECLASSIFIED ${revision}. MIT: see LICENSE.txt. Geometry © original contributors. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"${overlayAttrs.fill ? ` fill="${escapeXml(overlayAttrs.fill)}"` : ''}><title>${escapeXml(spec.name + ' · ' + label)}</title><style>${palette}${globalStyle}</style>${body}</svg>\n`
    assert.ok(!/\b(?:script|foreignObject|https?:\/\/|onload)\b/.test(body), 'Unsafe SVG content')
    const output = path.join(dir, `${layer}.svg`)
    writeFile(output, svg)
    manifest.files.push({ file: path.relative(root, output).replaceAll('\\', '/'), sha256: crypto.createHash('sha256').update(svg).digest('hex'), source: sourceLink('src/data/maps/blackOps6Maps.tsx', overlay.loc.start.line), sourceKey: svgKey })
  }
  writeFile(path.join(dir, 'SOURCE.txt'), `Map artwork and source coordinates: DECLASSIFIED\n${repo}\nRevision ${revision}\nMIT license: LICENSE.txt\nConverted from SVGOverlay JSX into static SVG. Geometry and framing preserved; neutral display palette and CSS property spelling normalized. Coordinates converted from Leaflet [latitude, longitude] on [0,0]–[512,512] to normalized top-left coordinates.\n`)
}
writeJson(path.join(snapshot, 'artwork-manifest.json'), manifest)
if (process.argv.includes('--render')) {
  const { chromium } = createRequire(path.join(root, 'desktop-app/package.json'))('playwright')
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const page = await browser.newPage({ viewport: { width: 1600, height: 940 }, deviceScaleFactor: 1 })
  const cards = specs.flatMap(s => s.layers.map(([id, label]) => `<article><h2>${s.name} · ${label}</h2><img src="${pathToFileURL(path.join(root, 'public/maps', s.id, id + '.svg'))}" /></article>`)).join('')
  const qa = path.join(snapshot, 'qa')
  fs.mkdirSync(qa, { recursive: true })
  const html = `<style>body{margin:0;background:#11151b;color:#e5e9ef;font:14px system-ui;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}article{background:#1b2028;border:1px solid #48515f}h2{font-size:15px;margin:10px}img{width:100%;height:405px;object-fit:contain}</style>${cards}`
  writeFile(path.join(qa, 'artwork.html'), html)
  await page.goto(pathToFileURL(path.join(qa, 'artwork.html')).href)
  await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode())))
  await page.screenshot({ path: path.join(qa, 'artwork.png'), fullPage: true })
  for (const spec of specs) for (const [layer, , , upstream] of spec.layers) {
    await page.setViewportSize({ width: 900, height: 900 })
    const source = read(root, `public/maps/${spec.id}/${layer}.svg`).replace(/<\?xml[^>]*>/, '')
    await page.setContent(`<style>body{margin:0;background:#1b2028}svg{width:900px;height:900px}</style>${source}`)
    await page.screenshot({ path: path.join(qa, `${spec.id}-${layer}.png`) })
    const pins = records.filter(r => r.map === upstream && r.loc && ['perks', 'mainQuest'].includes(r.group)).map(r => `<g><circle cx="${r.loc[1]}" cy="${512-r.loc[0]}" r="2.4" fill="${r.group === 'perks' ? '#38bdf8' : '#facc15'}" stroke="#111827" stroke-width=".8"/><text x="${r.loc[1]+3}" y="${512-r.loc[0]-3}" font-size="4.7" fill="white" stroke="#111827" stroke-width="1.2" paint-order="stroke">${escapeXml(r.id)}</text></g>`).join('')
    await page.setContent(`<style>body{margin:0;background:#1b2028}svg{width:900px;height:900px}</style>${source.replace('</svg>', pins + '</svg>')}`)
    await page.screenshot({ path: path.join(qa, `${spec.id}-${layer}-pins.png`) })
  }
  await browser.close()
}
console.log(JSON.stringify(Object.fromEntries(specs.map(s => [s.id, { layers: s.layers.length, records: records.filter(r => s.layers.some(l => l[3] === r.map)).length }])), null, 2))
if (process.argv.includes('--inspect')) process.exit(0)

// Dataset construction and the curated guide bindings follow below.
const miscTypes = {
  ammoCrate: ['ammo', 'ammo-cache'], ampUnit: ['upgrade', 'generator'], arsenal: ['upgrade', 'arsenal'],
  boatStation: ['travel', 'fast-travel'], cannon: ['travel', 'fast-travel'], caveSlide: ['travel', 'fast-travel'],
  craftingTable: ['equipment', 'crafting-table'], door: ['travel', 'door-buy'], doorPower: ['travel', 'door-buy'],
  elevator: ['travel', 'fast-travel'], exfillRadio: ['travel', 'exfil'], gobblegum: ['equipment', 'gobblegum'],
  launcher: ['travel', 'launch-pad'], mysteryBox: ['weapon', 'mystery-box'], papMachine: ['upgrade', 'pack-a-punch'],
  parachute: ['travel', 'fast-travel'], portal: ['travel', 'portal'], portalBlue: ['travel', 'portal'],
  portalGreen: ['travel', 'portal'], portalRed: ['travel', 'portal'], portalYellow: ['travel', 'portal'],
  power: ['upgrade', 'power-switch'], rampageInducer: ['equipment', 'challenge-starter'], trap: ['trap', 'trap'],
  wallArmor1: ['equipment', 'armor-buy'], wallArmor2: ['equipment', 'armor-buy'], wallbuy: ['weapon', 'wall-buy'],
  workbench: ['quest', 'workbench'], zipline: ['travel', 'zipline'], ziplineDown: ['travel', 'zipline'], ziplineUp: ['travel', 'zipline'],
}
const questTypes = {
  aetherCrystal: 'quest-item', aetherCrystalPodium: 'ritual-site', aethericFlora: 'quest-mechanism', alcoholBottle: 'quest-item',
  armoury: 'named-area', bankVault: 'named-area', barEgg: 'challenge-starter', bastardSword: 'weapon',
  bastardSwordUpgrade: 'upgrade-station', bastardSwordUpgradeCollectible: 'buildable-part', blueCrystal: 'quest-item',
  bonus: 'quest-mechanism', bonusPoints: 'power-up', bossFight: 'boss-arena', cannonEgg: 'challenge-starter',
  cannonPart: 'buildable-part', clue: 'clue', culinaryDelight: 'workbench', culinaryDelightIngredient: 'buildable-part',
  cursedTreasureHunt: 'quest-mechanism', cursedTreasureHuntSkeleton: 'ritual-site', digSite: 'dig-site',
  doublePoints: 'power-up', evilSamComputer: 'quest-mechanism', evilSamTrapComplete: 'trap', fireSale: 'power-up',
  frankenKlaus: 'robot', freePerk: 'perk-reward', fullPower: 'power-up', goldArmour: 'armor-buy',
  gorgofexUpgrade: 'upgrade-station', instaKill: 'power-up', interactable: 'quest-mechanism', klausLegs: 'buildable-part',
  mainQuest: 'quest-mechanism', maxAmmo: 'power-up', maxArmour: 'power-up', megaStuffyCollectible: 'buildable-part',
  megaStuffyMain: 'quest-mechanism', meteorMain: 'named-area', meteorTower: 'quest-mechanism', mrPeeksBoatRace: 'challenge-starter',
  mrPeeksBowling: 'challenge-starter', mrPeeksBowlingShoe: 'collectible', mrPeeksHeadphones: 'music-item',
  mrPeeksHideNSeek: 'collectible', nuke: 'power-up', pointOfPower: 'trap', questCollectible: 'quest-item',
  ritualChalice: 'ritual-site', ritualCollectible: 'quest-item', ritualStep: 'ritual-site', samFile: 'clue',
  secretArea: 'named-area', shovel: 'equipment', sporesEgg: 'perk-reward', sporesEggIsland: 'named-area', statueHead: 'quest-item',
  tombCrystalStep: 'ritual-site', whackACrab: 'challenge-starter', wonderWeapon: 'weapon', wonderWeaponCollectible: 'buildable-part',
  wonderWeaponStep: 'quest-mechanism', wunderwaffeComplete: 'weapon', wunderwaffeStart: 'quest-mechanism', wunderwaffeStep: 'quest-mechanism',
}
const categoryByType = { weapon: 'weapon', 'upgrade-station': 'upgrade', trap: 'trap', 'perk-reward': 'perk', 'named-area': 'area', 'boss-arena': 'area', equipment: 'equipment', 'armor-buy': 'equipment', 'power-up': 'equipment' }
const overrides = {
  GCP5X: { typeId: 'workbench', label: 'Jet Gun workbench · Motor Lodge' },
  dmzoe: { precision: 'area', availability: 'candidate', description: 'Search the debris piles inside Radio House for the wires after opening its shutter with a Mangler cannon blast. This pin marks the search room, not a guaranteed pile.' },
  fv8Dz: { label: 'Jet Gun handbrake · toolshed' },
  IKvE8: { typeId: 'buildable-part', label: 'Water valve · Lily’s Flowerpot' },
  SvGXG: { typeId: 'buildable-part', label: 'LTG part · Olly’s Comics ceiling' },
  O1Xh5: { typeId: 'buildable-part', label: 'LTG part · Washington Avenue window' },
  fyjJz: { typeId: 'buildable-part', label: 'LTG part · church balcony' },
  mrMRU: { typeId: 'quest-mechanism' }, '9uYMI': { typeId: 'quest-mechanism' }, SkNCT: { typeId: 'quest-mechanism' },
  qqgUA: { label: 'EMF Fob · Research Office', typeId: 'key', description: 'Collect the EMF Fob from the trapped scientist in the opened Research Office. It unlocks the Sea Tower briefcase.' },
  YPTol: { label: 'Multiphasic Resonator · Sea Tower case', typeId: 'quest-item', description: 'Use the EMF Fob to open the Sea Tower briefcase and take the Multiphasic Resonator.' },
  MFkM_: { label: 'Research Office computer', description: 'Install the Multiphasic Resonator here, then use the three laptop clues and the room’s equations. Follow the guide for the code and calibration step.' },
  RpokI: { typeId: 'npc' }, Le2z8: { typeId: 'npc' },
  TB1Ey: { precision: 'area', availability: 'candidate' }, lgO4Q: { precision: 'area', availability: 'candidate' },
  SLY7x: { precision: 'area', availability: 'candidate' }, ELKta: { precision: 'area', availability: 'candidate' },
  '2ksQs': { precision: 'area', availability: 'candidate' }, wb60Z: { precision: 'area', availability: 'conditional', description: 'Dungeon reference area for the lightning rod dropped by an armored zombie. This is not a fixed item spawn.' },
  '7ERDa': { precision: 'area', availability: 'conditional', description: 'Reference area for collecting Pegasus’ Horseshoe after the cannon launch. Follow the current storm cloud; the marker is not a guaranteed landing point.' },
  Rlskg: { description: 'Place the three lightning rods in the rampart urn, complete its storm charging sequence with the Stag sword, then insert the charged sword to forge Durendal.' },
  '6UGOZ': { description: 'The Mystic Orb appears in Dining Hall after the knight salute sequence. Follow the guide’s current order: matching incantation, then inspect the matching elemental sword at each knight.' },
  r6Fa8: { typeId: 'code-symbol' }, ToSQg: { typeId: 'code-symbol' },
  nTUaW: { precision: 'area', description: 'Look above this Dark Aether Nexus area for the floating symbol rocks after the Ice Staff lantern challenge. The area marker does not pinpoint all three airborne rocks.' },
  uYOYi: { precision: 'area', availability: 'candidate', description: 'Dark Aether Nexus escort reference. The closed gateway is selected by the current attempt; use the three rock symbols at its outside face, then escort the orb inside. This is not a guaranteed gateway location.' },
  _husd: { precision: 'area' },
  tS3jp: { precision: 'area', availability: 'conditional', description: 'Lab Technician search area in Service Tunnel / Mainframe Chamber. The named zombie drops the floppy disk; its movement is not fixed to this marker.' },
  qYnw9: { typeId: 'buildable-part' }, L_Z5J: { typeId: 'buildable-part' }, hyuEe: { typeId: 'quest-mechanism' },
  bDTg6: { precision: 'area', availability: 'candidate', typeId: 'quest-item' }, sb2v4: { typeId: 'quest-item' },
  zbk_g: { precision: 'area', availability: 'conditional', typeId: 'buildable-part', description: 'Android Assembly reference area only. Shoot the arms off Kommando Klaus enemies during their special rounds and collect both quest arms; they have no fixed map spawn.' },
  mqfFg: { precision: 'area', availability: 'conditional', description: 'Pack-a-Punch moves around the Particle Accelerator chamber after its power setup. This marker indicates the chamber, not a stationary machine position.' },
  o2IM2: { precision: 'area', description: 'Use one of the filled mop buckets to clean the Fungal Head, then charge it with nearby kills. This reference area is not a separate guaranteed bucket spawn.' },
  QsAqf: { description: 'One of the power surge computers in Dark Entity Containment. The source locates this computer only; consult the guide and room for the other terminals before beginning the timed sequence.' },
  _r76O: { precision: 'area', description: 'Teleportation Lab lockdown control area. The source provides one representative position; find and operate all required switches around the room.' },
  x89d1: { precision: 'area' }, qkJFg: { precision: 'area' }, TLo2x: { precision: 'area', floor: 'Tower 3 · Vault 1', description: 'Tower 3 first-vault reference area. Use the guide for the allegiance choice and ascent sequence; this marker does not identify the final rooftop boss arena.' },
}
const excludedReasons = { Q6sId: 'Upstream Floor 3 boss pin duplicates Floor 1 coordinates on a multi-floor atlas. Excluded until separately verified.' }
const areaTypes = new Set(['boss-arena', 'named-area'])
const idFor = id => 'dc-' + Buffer.from(id, 'utf8').toString('hex')

// Each tuple binds a real full/quick guide step to source marker IDs. Empty or
// unsupported spatial steps deliberately have no invented map link.
const bindings = {
  'bo6-liberty-falls': [
    ['setup-open', 'Church · Pack-a-Punch & S.D.G.', '3f0zk 7RCQd'],
    ['jet-valve', 'Water valve → pressure gauge', 'IKvE8 4vmr0', 'sequence'],
    ['jet-brake', 'Groundskeeper’s toolshed & handbrake', '6kxsh fv8Dz'],
    ['jet-wire', 'Radio House wire search', 'nrdC1 dmzoe', 'area'],
    ['jet-build', 'Jet Gun workbench', 'GCP5X'],
    ['ltg-parts', 'Three LTG parts', 'SvGXG O1Xh5 fyjJz'],
    ['capture-place', 'Aether storms & S.D.G. canister', '7RCQd 33Wyd VGizY'],
    ['capture-defend', 'LTG defense locations', '33Wyd VGizY'],
    ['capture-kill', 'D.A.G.F. trap locations', 'JtuLa Dw9iZ'],
    ['strauss-read', 'Three Strauss Counter projectors', 'mrMRU 9uYMI SkNCT'],
    ['strauss-canister', 'Second Aetherium canister', 'xG8zU'],
    ['capture-two', 'Second capture · storm & trap sites', '33Wyd VGizY JtuLa Dw9iZ'],
    ['capture-return', 'Return both canisters to the S.D.G.', '7RCQd'],
    ['finale-ready', 'Church finale starting machine', '7RCQd'],
    ['aetherella-route', 'All nine Aetherella figures', 'YeXWV zM2jb 0OHjM G4IGc 4w4zQ ypSrs KnYD1 7xM7R gKJVw'],
    ['vault-notes', 'Three bank vault code notes', '59M0p AmVI8 Wa3zX'],
    ['vault-loot', 'Bank vault', 'DzJw9'],
    ['bowling-shoes', 'Five bowling shoes · first game', 'C1_lA XDpvp TVoa1 VQG2f dtAm9'],
    ['bowling-play', 'Bowling game & replay shoe', 'uqQGR bw8QU'],
    ['deadshot', 'Cemetery Deadshot cans', 'mZN2H'],
    ['raining', 'Falling zombies trigger', 'W0cQ7'],
    ['vending', 'Vending machine', '0JqXi'],
    ['peeks-car', 'Black-and-gold car candidates', '9G12F Z0ygP tQAjx', 'candidates'],
    ['song', 'Music headphones', 'yGbi1 91uL5 W79dg'],
    ['rave', 'Dancing zombie viewfinders', 'ycopO Xvkv1'],
    ['blood-pool', 'Blood pool', 'C0jxR'],
    ['church-candles', 'Church candle racks', '9DjTf jgS2I'],
    ['powerups-list', 'Hidden power-up models', '@powerups'],
    ['liberty-fire-sale', 'Hidden Fire Sale', 'GrnIU'],
    ['map-perks', 'Perks & upgrade services', '@services'],
  ],
  'bo6-terminus': [
    ['power-amps', 'Three AMP defenses', 'mirN9 qXjPU edApn', 'sequence'],
    ['power-pap', 'Bio Lab lift & Pack-a-Punch positions', '1gvoI Pnuab K9sai'],
    ['beam-boxes', 'Research Office entrance', 'Ou1IZ'],
    ['beam-fob', 'EMF Fob → Sea Tower briefcase', 'qqgUA YPTol', 'sequence'],
    ['lab-laptops', 'Three calibration laptops', 'Mf27c LfFld kpoPI'],
    ['lab-calculate', 'Research Office computer & Peck', 'MFkM_ RpokI'],
    ['lab-wait', 'Research Office computer', 'MFkM_'],
    ['island-blue', 'Castle Rock blue orb', 'B1eCK'],
    ['island-repeat', 'Green orb → purple orb → workbench', 'H01OH 1z76S 3XxrN', 'sequence'],
    ['hard-drive-trap', 'Four possible hard-drive tentacle traps', '_lR_D gI_wA mnhja zs2vI', 'candidates'],
    ['nathan-code', 'Clock → playing card → injury sign', 'CjGiW VkRsN 7G0o1', 'sequence'],
    ['nathan-fight', 'Nathan’s Bio Lab chamber', 'hDBzb'],
    ['nathan-keycard', 'Nathan keycard search', 'CPqC_'],
    ['network-lockdown', 'Shipwreck connector lockdown', 'vKqWW gJNh7'],
    ['network-install', 'Three connector sockets · repair two', 'sAcWz CzhcI U14_m', 'candidates'],
    ['hack-prepare', 'Peck · hacking device', 'RpokI'],
    ['hack-buoys', 'Three hacking buoys', 'rhX1n pEAjE 5wus2'],
    ['hack-bombs', 'Three Bio Lab bomb sites', 'EajSJ apKMt pzVxm'],
    ['patient-ready', 'Patient 13 encounter entrance', 'HfuK3'],
    ['pirate-watch', 'Sea Cave treasure quest start', 'BP6Xq'],
    ['pirate-coins', 'Three cursed skeletons', '3Ig9c ZlkGz nTqHJ'],
    ['stuffy-find', 'Six Mega-Stuffy toys', '0cv_q gmj3c zp3ym jRnGe XjZgQ 523nW'],
    ['stuffy-build', 'Mega-Stuffy assembly · Living Quarters', 'gyHuC'],
    ['caged-perk', 'Bio Lab cage challenge', 'aFker'],
    ['spore-perk', 'Spore island candidates & final Sea Cave', 'K1Qqi Wwi1L IrCcu rVsH3 e2wmE', 'candidates'],
    ['rebreather', 'Underwater rebreather', 'qjQEz'],
    ['crabs', 'Crab Island minigame trigger', 'YqWno'],
    ['races', 'Published boat-race start', 'O7hw0'],
    ['cook-fish', 'Cooking pan & five mapped ingredients', 'N_OVB lZCQo zQvyy Ygw12 kL_5g 24MSZ'],
    ['meteor', 'Meteor towers → Void Cannon → landing site', 'PvId2 sesSc tJ0GF 3ZEt8', 'sequence'],
    ['term-song', 'Music headphones', 'PKXhh Xwbf2 mbyjQ'],
    ['basketball', 'Basketball reward', 'Rs0K4'],
    ['sentinel', 'Sentinel fast-travel marking', '3LAwr'],
    ['elevator', 'Elevator jumpscare', 'cDHde'],
    ['term-powerups-list', 'Hidden power-up models', '@powerups'],
    ['terminus-fire-sale', 'Hidden Fire Sale', 'R2HHT'],
    ['term-services', 'Perks & upgrade services', '@services'],
  ],
  'bo6-citadelle-des-morts': [
    ['castle-open', 'Cannon → Pack-a-Punch', '8A54Q EBKrd', 'sequence'],
    ['castle-krafft', 'Krafft’s cell & Alchemical Lab', 'Le2z8 7aKbb'],
    ['castle-stamps', 'Four knight sword statues', 'QfxS5 KGyrV 42s5g 9C1DV'],
    ['dragon-flames', 'Dragon statue & three braziers', '8QlMF 2iUPs mpOkM DPIJA'],
    ['stag-rods', 'Three lightning rod references', 'JqsLU hh3Pv wb60Z'],
    ['stag-storm', 'Stag sword storm urn', 'Rlskg'],
    ['raven-trophy', 'Antiquity search · Alchemical Lab', '2ksQs', 'area'],
    ['raven-wheel', 'Raven sword wheel · Tavern Cellar', '4cszs'],
    ['raven-orbs', 'Raven sword upgrade room', '4cszs'],
    ['lion-door', 'Lion sword door', 'SKx8c'],
    ['lion-pedestal', 'Lion sword upgrade entrance', 'SKx8c'],
    ['incantation-fire', 'Wood bundles & fire ritual', 'bdRP2 ZT7wi Jw3mF KINbg'],
    ['incantation-electric', 'Horseshoe references & electric ritual', 'SfjDB 7ERDa 3wP8a'],
    ['incantation-dark', 'Raven release & dark ritual', 'RMXsK RXF7n'],
    ['incantation-light', 'Paladin’s Brooch & light ritual', 'cC4KM Rz6X0'],
    ['bottles', 'Undercroft symbol wall', 'Ux1rW'],
    ['book-pages', 'Four Sitting Rooms page search areas', 'TB1Ey lgO4Q SLY7x ELKta', 'area'],
    ['book-traps', 'Six Point of Power traps', 'UV7WP RSzpo QPh5Z BwIRp q48DR BhTte'],
    ['knights-salute', 'Knight statues & Mystic Orb', 'QfxS5 KGyrV 42s5g 9C1DV 6UGOZ'],
    ['orb-fire', 'Fire orb pedestal', 'i5G3V'],
    ['orb-electric', 'Electric orb pedestal', 'JKqce'],
    ['orb-dark', 'Dark orb pedestal', 'Rx6v2'],
    ['orb-light', 'Light orb pedestal', 'rt2J9'],
    ['guardian-key', 'Secret Study & Guardian Key', 'VunDA mPlz7'],
    ['guardian-start', 'Guardian encounter start', 'fKytn'],
    ['side-bartender', 'Three liquor bottles & Tavern tray', 'XfhFB QG2Bi YphwX NDa_G'],
    ['side-peeks', 'Peeks hide-and-seek · four-shot order', '2hPGY rsSfg gzyWO aEKQ6', 'sequence'],
    ['side-raven-perk', 'Cave slide raven release reference', 'RMXsK'],
    ['side-wall', 'Undercroft rune wall', 'Ux1rW'],
    ['cannon-repair', 'Cannon gear & blowtorch', 'WAuh7 OQb8p 8A54Q'],
    ['bell', 'Bell-tower cannon route', '9PVYZ'],
    ['song-slave', 'Music headphones', 'doiWV gb211 1OLl5'],
    ['song-caliburn', 'Three Caliburn braziers', '2iUPs mpOkM DPIJA'],
    ['powerup-targets', 'Hidden power-up models', '@powerups'],
    ['services', 'Perks & upgrade services', '@services'],
  ],
  'bo6-the-tomb': [
    ['tomb-open', 'Nexus gateways & Pack-a-Punch positions', '@tombgateways'],
    ['tomb-prep', 'Perks & upgrade services', '@services'],
    ['staff-bull', 'Bull mural', 'r6Fa8'],
    ['staff-archer', 'Archer mural', 'ToSQg'],
    ['staff-build', 'Nexus Staff altar', '_pOlx'],
    ['upgrade-rocks', 'Floating symbol-rock search area', 'nTUaW', 'area'],
    ['upgrade-escort', 'Nexus orb escort reference', 'uYOYi', 'area'],
    ['trial-vermin', 'Vermin Nexus statue → map podium', 'lCTn_ diD9k', 'sequence'],
    ['trial-parasite', 'Parasite Nexus statue → map podium', 'e4htw CPBgu', 'sequence'],
    ['trial-doppelghast', 'Doppelghast Nexus statue → map podium', 'mMyTR pno4V', 'sequence'],
    ['trial-amalgam', 'Amalgam Nexus statue → map podium', 'cOvgh oM3Br', 'sequence'],
    ['sentinel-prep', 'Sentinel Artifact encounter entrance', 'JdMge'],
    ['armor-heads', 'Two statue-head containers', 'thyY2 mGqQL'],
    ['armor-buy', 'Golden Armor reward', 'VVEzJ'],
    ['shovels', 'Four shovel locations', 'cfACw Isy4y XsUGD jsDXJ'],
    ['raygun', 'Published dig-site locations', '@digsites'],
    ['waterfalls', 'Two frozen-waterfall targets', 'TcECm V7HfA'],
    ['floating-rock', 'Floating-rock reward area', '_husd', 'area'],
    ['aether-song', 'Music headphones', 'dNdWq 3cTsU QxSwa'],
    ['tomb-powerup-targets', 'Hidden power-up models', '@powerups'],
    ['tomb-map', 'Services & Nexus gateways', '@tombgateways'],
  ],
  'bo6-shattered-veil': [
    ['sv-elevator', 'Fuse → circuit board → elevator', 'qYnw9 L_Z5J hyuEe', 'sequence'],
    ['sv-gear', 'Perks & upgrade services', '@services'],
    ['sv-floppy', 'Technician search area & fax machine', 'tS3jp uwMYC'],
    ['sv-cipher', 'Nursery clue → Service Tunnel keypad → Ray Gun case', 'X0A_C ZHWDN s4lOm', 'sequence'],
    ['sv-canister-crystals', 'Four blue-crystal canister candidates', 'b6R76 spNfW PFBY6 Vel0p', 'candidates'],
    ['sv-canister-kazimir', 'Rear Patio Kazimir canister', 'g1Jjf'],
    ['sv-canister-gas', 'Mainframe gas valves & chamber', 'Kfdhp YHvIl'],
    ['sv-w-charge', 'Shem’s Henge charger & W workbench', 'hktdR x5z67'],
    ['sv-w-portal', 'Sconce → distillery entrance → liminal space', 'sb2v4 mRA9W AUQIF', 'sequence'],
    ['sv-w-flask', 'Service Bell search area & bar', 'bDTg6 YKzSt'],
    ['sv-w-ritual', 'Blue distillery ritual', 'RoSpw'],
    ['sv-p-charge', 'Serpent Mound entrance, charger & P workbench', 'GMrCh kcfL2 L62F6'],
    ['sv-p-mirrors', 'Two reflectors', 'yb2C7 eanec'],
    ['sv-p-chalices', 'Banquet Hall portal & three chalices', 'rFYYN fOhbp 76wM6 MVMPK'],
    ['sv-p-safe', 'Safe → purple ritual', 'BfrTS lPUAz', 'sequence'],
    ['sv-r-charge', 'Conservatory charger & R workbench', 'KOsFu qXCsN'],
    ['sv-r-items', 'Library liminal-space entrance', '2m7Oo'],
    ['sv-r-books', 'Library vault & yellow ritual', 'zLikw Dhelk'],
    ['sv-boss-ready', 'S.A.M. platform · boss start', 'RXwUX'],
    ['sv-side-waffe', 'Wunderwaffe start → orb sites → reward', 'Jn9Ol U2ogz JAOpX 9Le70 pBvk7'],
    ['sv-side-bell', 'Service Bell search & bar', 'bDTg6 YKzSt'],
    ['sv-side-marine', 'Deer-head shotgun pedestal', 'FpF7V'],
    ['sv-side-laser', 'S.A.M. computer candidates & trap console', '8SwkB X6B_L 8i9n_ jK_ol', 'candidates'],
    ['sv-side-sleep', 'Grandfather clock → bed', 'xfavY 8blGa', 'sequence'],
    ['sv-side-ghost', 'Mansion jumpscare reference', 'nyVhH'],
    ['sv-side-song', 'Music headphones', 'YVtDC 49HJa uZqcP'],
    ['sv-side-powerups', 'Hidden power-up models', '@powerups'],
  ],
  'bo6-reckoning': [
    ['rec-power', 'Accelerator power & moving Pack-a-Punch', '8FJaZ mqfFg'],
    ['rec-early', 'Klaus arm reference & mop-bucket positions', 'zbk_g O_BUs RBNxh'],
    ['rec-dna', 'DNA vial fridge · Mutant Research', 'Y5YcP'],
    ['rec-fowler', 'Syringe → blood sample → centrifuge', 'cSsaz 9C2DV dOQMz', 'sequence'],
    ['rec-scan', 'Bio Scanner door', 'eRGzO'],
    ['rec-element', 'Element clues & Bioweapons Lab keypads', 'yKp0H vsI0O ZewHy vdjUn'],
    ['rec-cyst', 'Cyst & three Aetheric Flora sites', 'khtv_ ibPbV r_MdI ESbfY'],
    ['rec-surge', 'Mapped power-surge computer & Forsaken panel', 'QsAqf RZ3Fz'],
    ['rec-forge', 'Gorgofex forge', 'p5vLs'],
    ['rec-parts', 'Four Klaus-leg candidates', 'SDOUT BtK7p s2_Sp 2ZgTv', 'candidates'],
    ['rec-klaus-power', 'Klaus assembly → first terminal → trial', 'peX7s FsyN6 gHBuk', 'sequence'],
    ['rec-files', 'S.A.M. file candidate positions', 'Xnrsc ApwQt IU3cX HMx_r br4mJ k0BDe yO_9S', 'candidates'],
    ['rec-file-code', 'Teleportation Lab code terminal', '7E7uf'],
    ['rec-brain', 'Quantum brain → containment chamber', 'ytVc7 t5x4V', 'sequence'],
    ['rec-orb', 'Quantum Vermin device → portal crystals', 'zBqlF 7RFoK', 'sequence'],
    ['rec-head', 'Fungal Head & two mop-bucket positions', '60s9q O_BUs RBNxh'],
    ['rec-head-feed', 'Fungal Head charging area → portal', 'o2IM2 Zt5sd', 'sequence'],
    ['rec-vacuum', 'Vacuum device container & return console', 'Y8o2y QFj29'],
    ['rec-lockdown', 'Teleportation Lab console & switch area', 'QFj29 _r76O'],
    ['rec-final-prep', 'Tower 3 portal', 'EsUDS'],
    ['rec-ascent', 'Tower 3 · canisters & crystal-floor references', 'TLo2x uPa5O xeWFn DbRHT x89d1 qkJFg'],
    ['rec-upgrade-c', 'Corpsloder upgrade reference', 'BYeNV'],
    ['rec-upgrade-n', 'Necrodystonia upgrade reference', 'JFsLj'],
  ],
}

const exclusions = []
for (const spec of specs) {
  const guide = bo6Guides.find(g => g.id === spec.id)
  const raw = records.filter(r => spec.layers.some(l => l[3] === r.map))
  const locations = raw.flatMap(r => {
    const reason = excludedReasons[r.id] || (!r.loc || r.loc.every(v => v === 0) ? 'No spatial coordinate supplied by the source; no fixed pin created.' : null)
    if (reason) { exclusions.push({ mapId: spec.id, sourceId: r.id, label: r.label, reason }); return [] }
    assert.ok(r.loc.length === 2 && r.loc.every(v => Number.isFinite(v) && v >= 0 && v <= 512), `${spec.id}/${r.id}: source position outside framing`)
    const key = r.typeRef.split('.')[1]
    const [category, typeId] = r.group === 'perks' ? ['perk', key === 'wunderFizz' ? 'wunderfizz' : 'perk-machine'] : r.typeRef.startsWith('MiscTypes.') ? miscTypes[key] : [categoryByType[questTypes[key]] || 'quest', questTypes[key]]
    assert.ok(typeId, `Missing physical type mapping for ${r.typeRef}`)
    const special = overrides[r.id] || {}
    const inferredArea = areaTypes.has(special.typeId || typeId) || /location (?:just )?for reference|can be found around|various spots/.test(r.description.toLowerCase())
    const precision = special.precision || (inferredArea ? 'area' : 'point')
    const candidate = /possible (?:spawn )?location|potential islands|one of them will drop|1 of [347] possible|on any of the shelves/i.test(r.description) || typeId === 'mystery-box'
    const availability = special.availability || (candidate ? 'candidate' : ['mainQuest', 'easterEggs'].includes(r.group) || ['wunderfizz', 'exfil', 'pack-a-punch', 'workbench'].includes(typeId) ? 'conditional' : 'fixed')
    const description = (special.description || r.description || `Published ${r.label} location. Availability may depend on round, power, doors or quest progress.`).replace(/1 of 3 needed for the easter egg song\. 1 of 3 needed for the easter egg song\./g, 'One of three headphones for the music Easter egg.')
    const location = {
      id: idFor(r.id), sourceId: r.id, label: r.label === 'PHD' ? 'PhD Flopper' : r.label, layerId: spec.layers.find(l => l[3] === r.map)[0],
      x: r.loc[1] / 512, y: 1 - r.loc[0] / 512,
      category, typeId, availability, precision,
      ...(precision === 'area' ? { areaRadius: 0.025 } : {}),
      description, source: sourceLink(r.sourceFile, r.line),
      ...special,
    }
    if (location.typeId !== typeId) location.category = categoryByType[location.typeId] || (['key','buildable-part','quest-item','quest-mechanism','code-symbol','workbench','npc'].includes(location.typeId) ? 'quest' : category)
    if (location.typeId === 'perk-machine') location.perkType = 'machine'
    if (['generator','power-switch','pack-a-punch','perk-machine','wunderfizz','arsenal','workbench'].includes(location.typeId)) location.overview = true
    if (availability === 'candidate') location.conditions = 'Possible location; the active spawn or chosen site depends on the current run.'
    if (r.map === 'reckoningBossArena' && !location.floor) location.floor = /^Floor 2/.test(r.label) ? 'Tower 3 · Vault 2' : 'Tower 3 · Vault 1'
    if (['YeXWV','zM2jb','0OHjM','G4IGc','4w4zQ','ypSrs','KnYD1','7xM7R','gKJVw'].includes(r.id)) { location.typeId = 'collectible'; location.category = 'quest' }
    return [location]
  })
  assert.equal(new Set(locations.map(l => l.id)).size, locations.length, `${spec.id}: transformed ID collision`)
  const locIds = new Set(locations.map(l => l.id))
  const selection = token => token === '@services' ? locations.filter(l => ['perk-machine','wunderfizz','pack-a-punch','arsenal','crafting-table'].includes(l.typeId)).map(l => l.id) : token === '@powerups' ? locations.filter(l => l.typeId === 'power-up').map(l => l.id) : token === '@digsites' ? locations.filter(l => l.typeId === 'dig-site').map(l => l.id) : token === '@tombgateways' ? locations.filter(l => ['portal','pack-a-punch'].includes(l.typeId)).map(l => l.id) : token.split(' ').map(idFor)
  const steps = [...guide.phases, ...guide.sidePhases].flatMap(p => p.steps)
  const targets = bindings[spec.id].map(([stepId, title, ids, kind]) => {
    assert.ok(steps.some(s => s.id === stepId), `${spec.id}: missing step ${stepId}`)
    assert.ok(read(root, `app/components/guide/${spec.id}.vue`).includes(`id="guide-step-${stepId}"`), `${spec.id}: full guide anchor missing for ${stepId}`)
    const locationIds = selection(ids)
    assert.ok(locationIds.length && locationIds.every(id => locIds.has(id)), `${spec.id}/${stepId}: missing source pins ${locationIds.filter(id => !locIds.has(id))}`)
    return { id: stepId, title, locationIds, kind: kind || (locationIds.length === 1 ? (locations.find(l => l.id === locationIds[0]).precision === 'area' ? 'area' : 'single') : 'area'), guideAnchor: `guide-step-${stepId}`, description: steps.find(s => s.id === stepId).quick }
  })
  const quickLinks = Object.fromEntries(targets.map(t => [t.id, t.id]))
  const activityFilters = [...guide.phases, ...guide.sidePhases].flatMap(p => {
    const ids = [...new Set(p.steps.flatMap(s => targets.find(t => t.id === s.id)?.locationIds || []))]
    return ids.length ? [{ id: p.id, label: p.title, locationIds: ids }] : []
  })
  const layers = spec.layers.map(([id, label, , upstream]) => ({
    id, label, image: `/maps/${spec.id}/${id}.svg`, width: 512, height: 512,
    note: upstream === 'reckoningBossArena' ? 'Community atlas of the Tower 3 vault floors, arranged separately. Floor 1 is at the bottom; Floor 2 is in the middle. Final-floor exact pins are withheld because the source repeats a lower-floor coordinate. Layout placement is not world distance.' : ['shatteredVeil','reckoning','tomb'].includes(upstream) ? 'Community vector atlas. Separate floors or realms are placed beside each other; use portals and the marker’s landmark details. Area rings are approximate search areas, not fixed item positions.' : upstream.startsWith('terminus') ? 'Community vector map. Choose Prison or Bio Lab & islands for the relevant floor. Island markers use the Bio Lab & islands layer; elevation within that layer is not separately modeled.' : 'Community vector layout. Point pins are published community positions; area rings mark search areas. Elevation is described in the marker or guide.',
    ...(spec.id === 'bo6-liberty-falls' ? { focusBounds: [[0.08, 0.29], [0.94, 0.83]] } : {}),
    ...(upstream === 'terminusPrison' ? { focusBounds: [[0.39, 0.30], [0.68, 0.67]] } : {}),
  }))
  const dataset = {
    id: spec.id, name: spec.name, defaultLayer: layers[0].id,
    sources: [
      { name: 'DECLASSIFIED community map & coordinates', url: `${repo}/tree/${revision}`, note: `MIT © Odinn H & Ben Ashley. Pinned revision ${revision}; SVG geometry and coordinate framing preserved. Physical types, cautious area precision and guide bindings added by CodWiki. Null positions and a duplicated-floor boss pin excluded. Not an independently surveyed or exhaustive inventory.` },
      { name: `${spec.name} guide references`, url: guide.sources[0], note: 'Existing CodWiki walkthrough sources support quest names, conditions and the linked guide steps. Pin coordinates come from the separately cited DECLASSIFIED source records.' },
    ], layers, locations, targets, quickLinks,
    filterGroups: [{ id: 'guide-activities', label: 'Guide activities', defaultFilter: activityFilters[0].id, filters: activityFilters }],
    coverage: { kind: 'guide-linked', note: 'Published community services and quest locations with guide links. Candidate markers are possible sites, area rings are approximate, and some optional activities have no verified spatial pins yet.' },
  }
  writeJson(path.join(root, 'app/data/maps', spec.id + '.json'), dataset)
  console.log(`${spec.id}: ${locations.length} locations, ${targets.length} guide targets, ${layers.length} layers`)
}
writeJson(path.join(snapshot, 'excluded-locations.json'), exclusions)
writeJson(path.join(snapshot, 'source-manifest.json'), {
  repository: repo, revision, license: 'MIT',
  files: fs.readdirSync(path.join(snapshot, 'src'), { recursive: true, withFileTypes: true }).filter(f => f.isFile()).map(f => {
    const file = path.join(f.parentPath, f.name)
    const relative = path.relative(snapshot, file).replaceAll('\\', '/')
    return { file: relative, source: sourceLink(relative), bytes: fs.statSync(file).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
  }),
})
