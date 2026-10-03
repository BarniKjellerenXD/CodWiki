import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { games, expansionGuides } from '../shared/expansion-guides.mjs'
import { expansionTools } from '../shared/expansion-tools.mjs'
import { retiredTools } from '../shared/retired-tools.mjs'
import { plannedMaps } from '../shared/planned-maps.mjs'
import * as references from '../shared/expansion-references.mjs'
import * as bo3References from '../shared/bo3-references.mjs'
import * as chroniclesReferences from '../shared/chronicles-references.mjs'
import * as bo2References from '../shared/bo2-references.mjs'
import * as classicReferences from '../shared/classic-references.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'))
const write = (name, value) => { const target=path.join(root,name); if(!fs.existsSync(target) || fs.readFileSync(target,'utf8')!==value) fs.writeFileSync(target,value) }
const json = value => JSON.stringify(value, null, 2) + '\n'
write('app/data/expansionTools.json', json(expansionTools))
write('app/data/expansionReferences.json', json(references))
write('app/data/bo3References.json', json(bo3References))
write('app/data/chroniclesReferences.json', json(chroniclesReferences))
write('app/data/bo2References.json', json(bo2References))
write('app/data/classicReferences.json', json(classicReferences))
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const sourceName = (url, gameId) => {
  const host = new URL(url).hostname.replace(/^www\./, '')
  if(['bo1','waw'].includes(gameId)&&host==='gamefaqs.gamespot.com')return 'GameFAQs original-game walkthrough and community research'
  if(gameId !== 'bo2' && ['codzombieguides.com','callofdutyzombies.com','discover.hubpages.com','gamefaqs.gamespot.com'].includes(host)) return `${host} reference`
  return ({'reddit.com': 'r/CODZombies community guide', 'codzombiesguides.com': 'COD Zombies Guides illustrated walkthrough', 'codzombieguides.com': 'JokerAlex21 illustrated guide', 'mmmrkennedy.com': 'mmmrkennedy illustrated guide', 'callofdutyzombies.com': 'Call of Duty Zombies community research', 'discover.hubpages.com': 'Edward D. Saterstad illustrated reference', 'gamefaqs.gamespot.com': 'GameFAQs original BO2 walkthrough', 'callofduty.com': 'Official Call of Duty guide', 'gamespot.com': 'GameSpot walkthrough', 'game8.co': 'Game8 reference', 'steamcommunity.com': 'Steam Community walkthrough'}[host] || `${host} reference`)
}
const catalogue = read('shared/catalogue.json')
const legacyMaps = catalogue.maps.filter(map => !map.gameId || map.gameId === 'bo7').map(map => ({ ...map, gameId: 'bo7', interactiveMap: true }))
const legacyTools = catalogue.tools.filter(tool => legacyMaps.some(map => map.id === tool.map))
catalogue.games = games
catalogue.maps = [...legacyMaps, ...expansionGuides.filter(guide => !guide.parent).map(guide => ({ id: guide.id, name: guide.name, route: `/guides/${guide.id}`, image: guide.image || '', gameId: guide.gameId, group: guide.group || '', interactiveMap: false, questLabel: guide.questLabel || 'Main quest', ...(guide.mode ? { mode: guide.mode } : {}) }))]
catalogue.guides = expansionGuides.filter(guide => guide.parent).map(guide => ({ id: guide.id, map: guide.parent, gameId: guide.gameId, name: guide.name, route: `/guides/${guide.id}` }))
catalogue.maps.push(...plannedMaps)
catalogue.tools = [...legacyTools, ...expansionTools.map(tool => ({ id: tool.id, map: tool.map, name: tool.name, route: `/tools/${tool.id}`, kind: tool.kind }))]
write('shared/catalogue.json', json(catalogue))
const quests = read('app/data/quickQuests.json')
for (const map of plannedMaps) {
  delete quests[map.id]
  write(`app/components/guide/${map.id}.vue`, `<!-- Generated map entry; full guide is planned. -->\n<template><MapEntry id="${map.id}" /></template>\n`)
  write(`app/pages/guides/${map.id}.vue`, `<!-- Generated from shared/planned-maps.mjs. -->\n<script setup>\nimport Content from '~/components/guide/${map.id}.vue'\n</script>\n<template><Content /></template>\n`)
}
for (const guide of expansionGuides) {
  quests[guide.id] = guide.phases.map(phase => ({ id: phase.id, title: phase.title, detail: `details-${phase.id}`, steps: phase.steps.map((step, i) => ({ id: step.id, html: escape(step.quick || step.text), ...(i === phase.steps.length - 1 && phase.tools.length ? { tools: phase.tools } : {}) })) }))
  const children = (guide.children || []).map(id => expansionGuides.find(g => g.id === id))
  const links = children.map(child => `<NuxtLink class="companion-button" to="/guides/${child.id}">${escape(child.name)} →</NuxtLink>`).join('\n')
  const parent = guide.parent ? `<p><NuxtLink to="/guides/${guide.parent}">← Outbreak hub and other quest</NuxtLink></p>` : ''
  const note = text => text ? `<p class="guide-callout">${escape(text)}</p>` : ''
  const body = [...guide.phases, ...(guide.sidePhases || [])].map(phase => `${phase.group ? `<h1 id="${phase.group === 'Main Quest' ? 'wiki_main_quest' : phase.group === 'Side Quests' ? 'wiki_side_quests' : phase.group === 'Key Features' ? 'wiki_key_features' : `wiki_${phase.group.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}">${escape(phase.group)}</h1>` : ''}<section><h2 id="details-${phase.id}">${escape(phase.title)}</h2>${note(phase.note)}<ol>${phase.steps.map(step => `<li id="guide-step-${step.id}" data-guide-step>${escape(step.text)}${step.bullets ? `<ul>${step.bullets.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : ''}${note(step.note)}${step.links ? `<p>${step.links.map(link => `<a href="${escape(link.href)}"${link.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(link.label)} ↗</a>`).join(' · ')}</p>` : ''}${step.images ? `<GuideIllustrations :images='${escape(JSON.stringify(step.images)).replaceAll("'", '&#39;')}' />` : ''}</li>`).join('\n')}</ol>${phase.tools.map(id => `<InlineTool tool="${id}" />`).join('\n')}</section>`).join('\n')
  const sources = guide.sources.map((url, i) => `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${['bo6', 'cw', 'bo3', 'bo2', 'bo1', 'waw'].includes(guide.gameId) ? escape(guide.sourceLabels?.[url] || sourceName(url, guide.gameId)) : url.includes('reddit') ? 'r/CODZombies community guide' : url.includes('tracker') ? 'COD Tracker walkthrough' : url.includes('steam') ? 'Steam Community walkthrough' : 'Supplementary walkthrough'}${i ? ` (${i + 1})` : ''} ↗</a></li>`).join('\n')
  write(`app/components/guide/${guide.id}.vue`, `<!-- Generated from shared/expansion-guides.mjs; edit the authored data. -->\n<template><div>${body}<section><h2 id="guide-sources">Sources and review</h2><p>${escape(guide.reviewNote || `Original concise walkthrough adapted from the sources below. Research reviewed ${guide.reviewed}. Use their illustrated references for exact object sightlines. Gameplay verification is ongoing.`)}</p><ul>${sources}</ul>${guide.image ? '<p>Select any reference image to enlarge it. Screenshot and symbol sources are credited in the linked walkthroughs; this guide uses local copies for reliable access.</p>' : ''}</section></div></template>\n`)
  const game = games.find(game => game.id === guide.gameId)
  write(`app/pages/guides/${guide.id}.vue`, `<!-- Generated from shared/expansion-guides.mjs. -->\n<script setup>\nimport Content from '~/components/guide/${guide.id}.vue'\n</script>\n<template><GuideArticle title="${escape(guide.name)}" map-name="${escape(game.name)}${guide.group === 'chronicles' ? ' · Zombies Chronicles' : ''}" storage-key="guide-pins-${guide.id}" quest-label="${escape(guide.questLabel || 'Main quest')}"><template #intro>${guide.image ? `<img class="expansion-cover" src="${escape(guide.image)}" alt="${escape(guide.name)} artwork" width="1200" height="400" fetchpriority="high" />` : ''}<p>${escape(guide.intro)}</p>${parent}${links}</template><Content /></GuideArticle></template>\n`)
}
for (const tool of expansionTools) write(`app/pages/tools/${tool.id}.vue`, `<!-- Generated from shared/expansion-tools.mjs. -->\n<template><PuzzlePage tool="${tool.id}" /></template>\n`)
for (const [id, destination] of Object.entries(retiredTools)) {
  if (expansionTools.some(tool => tool.id === id)) throw new Error(`Retired tool is still active: ${id}`)
  write(`app/pages/tools/${id}.vue`, `<!-- Generated compatibility route; this activity now lives in the guide. -->\n<script setup>\nawait navigateTo(${JSON.stringify(destination)}, { redirectCode: 301, replace: true })\n</script>\n<template><p><NuxtLink to="${escape(destination)}">Open this section in the map guide</NuxtLink></p></template>\n`)
}
write('app/data/quickQuests.json', json(quests))
