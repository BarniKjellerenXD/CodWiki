import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NO_PERCENT, STUCK_VIDEOS, anySource, countLabel, groupRows, independentReports, rankWords, rowConfidence, rowTarget, sightingsStale, sourcesSummary, topRows, videoUrl } from '../shared/dmz-sightings.mjs'
import { LIEUTENANT_VIDEOS, bossPlaybook, bossPlaybooks } from '../shared/dmz-playbooks.mjs'
import { BARRACKS, RECIPES_WITHOUT_SPOT, recipeHotspots, recipePlaybooks, recipesNoPlace, recipeSpotLine, runSamples } from '../shared/dmz-recipe-spots.mjs'
import { dmzIntel, intelSources } from '../shared/dmz-intel.mjs'
import { guideSources } from '../shared/dmz-guide-sources.mjs'
import { mapReportSources, mapReports } from '../shared/dmz-map-reports.mjs'
import { hajinLayer, hajinPin, hajinReports } from '../shared/dmz-map.mjs'
import { guideTiers } from '../shared/dmz-guide.mjs'
import { printerRecipes, recipeUnlock } from '../shared/dmz-stations.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const filesIn = dir => fs.readdirSync(path.join(root, dir), { recursive: true })
  .map(file => `${dir}/${file.replaceAll('\\', '/')}`)
  .filter(file => fs.statSync(path.join(root, file)).isFile())

const KINDS = ['mission', 'scripted', 'seen', 'unplaced', 'listed']
const reportRows = bossPlaybooks.flatMap(book => book.where || [])
const findRows = [...Object.values(recipePlaybooks).flatMap(book => book.rows || []), ...recipeHotspots]
const rows = [...reportRows, ...findRows]
const seenRows = counts => counts.map((seen, index) => ({ kind: 'seen', where: `Place ${index + 1}`, seen, sources: [] }))

// Every Watch it done list in the data, wherever it sits.
function videoRefs(value) {
  if (Array.isArray(value)) return value.flatMap(videoRefs)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, item]) => key === 'videos' && Array.isArray(item) ? item : videoRefs(item))
}
// Every string in a value except claims, the only text allowed to give a rate.
function strings(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, item]) => key === 'claims' ? [] : strings(item))
}
// The words loot spots show: the map's loot reports, and the guide's loot
// cards. Only the loot cards, since the guide's steps rightly say 'a third
// Active Duty slot'.
const lootReports = mapReports.filter(report => report.type === 'loot' || report.layer === 'loot')
const lootCards = guideTiers.flatMap(tier => tier.loot || [])
const videoLines = item => (item.videos || []).map(video => video.why)
const lootReportText = report => [report.where, report.note, ...videoLines(report)]
const lootCardText = card => [
  card.title, card.note, card.noVideo, ...(card.how || []), ...(card.fallback || []), ...videoLines(card),
  ...card.rows.flatMap(row => [row.where, row.search, row.note, ...(row.how || []), ...(row.fallback || []), ...videoLines(row)]),
]

const registries = { intelSources, guideSources, mapReportSources }
const allSources = Object.entries(registries).flatMap(([registry, sources]) => Object.entries(sources).map(([key, source]) => ({ registry, key, ...source })))
function youtubeId(url) {
  const link = new URL(url)
  if (link.hostname === 'youtu.be') return link.pathname.slice(1)
  if (!/(^|\.)youtube\.com$/.test(link.hostname)) return null
  return link.searchParams.get('v') || link.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1] || null
}
const videos = allSources.filter(source => source.url && /(^|\.)(youtube\.com|youtu\.be)$/.test(new URL(source.url).hostname))
// One page per URL, whatever the scheme, www or trailing slash. A YouTube page is one per v= id.
function pageOf(url) {
  const link = new URL(url)
  const video = /(^|\.)youtube\.com$/.test(link.hostname) && link.searchParams.get('v')
  return `${link.hostname.replace(/^www\./, '')}${link.pathname.replace(/\/+$/, '')}`.toLowerCase() + (video ? `?v=${video}` : '')
}

const ACRONYMS = ['DMZ', 'MW4', 'UAV', 'SAM', 'DRC', 'LMG', 'NVG', 'LTV', 'KNRP']
// This round's new videos, listed from the registries (keys added on 24 Oct 2026).
const ROUND_VIDEOS = `
  -Em393aaO_8 0DzJ-FyBpRU 10vlYImbVuU 13eg3OpR34I 2ACpJMOofdE 2Tg-AgqsA8s 3AKvA4MIoUw 3vVRYdq1yqQ
  5L48ScoonvA 6eU9cjjWxGg 86olmSrtJO8 8Hz69Y4Ln44 8lB8Riyufq8 9cRZ7Eenjxs 9JlJ2wHVqU0 ADHcn7sE7Pw
  AfupFbiZIXE aNPEaA2QAuY Ap6kPZMGAu8 B1z0rDPM1Vg bk7V9jtHXws El5JwszTuY0 eNtyFw5V3uI eSbUzAcSLac
  F4HvIa-4-Dc FFR1fCxCNSs fNNcz21Mxpo fqq_nISkD14 fqREcqCTutc GlYDmkTlw5I Gxz8Q9y-Zgk heiPR3lrYtk
  hMqTo5wPU0Q I2-aDLSxbrY IoIqlpz8WeY KNfIaW6w_4M lDcGkLQyPA4 LfZQ4-IhQww LHZfrImdQz4 LKH4DvNr2h8
  lqcuNvlvC24 M-wmH49Eqk0 MgPHtkOwSLI muOGab_gdGQ N0aYGF1v8Do nBhA8tN3FK8 NcWkUWBgXW4 nmwM5JjkT7w
  Nv7M_k7hL4g Nw4SJU0VpSg o4QWphYfdKo PIclqzc0r6c POmrSz5iCwg q0m5U2rKgyU Q5TNkJRmsSI qUBam_vThT8
  qW0FCGZ8tgU qYbvg2ZQxqo QyeywHoX8YA ScgLyw3u2ew T1j2laAS3vs TaxKFYxSeN0 u3QmuDSuJv4 U8B_RU-p07I
  UAhXOQ3CJpM Ue93MsX6tAk UhmkGfFXbPU UJn1HxLkeh0 Vz5wpOpOaPo X50ZJBNjfkw xS0GWCEQ_zw
`.split(/\s+/).filter(Boolean)
// A label ending in '(First Last)' reads like an author byline. These are
// publishers, sites and title subtitles that only look like one.
const PERSON = /^[A-Z][a-z'’-]+(?: [A-Z]\.)?(?: [A-Z][a-z'’-]+){1,2}$/
const NOT_BYLINES = new Set([
  'Activision Support', 'All Things How', 'Game Rant', 'Insider Gaming', 'The Based Otaku', 'Twisted Voxel', 'Windows Central', 'Xbox Wire',
  'All Prestige Requirements', 'Beginner\'s Guide', 'Board Note', 'Detonators Location', 'Early Access', 'First Mission', 'Fix Scheduled', 'Information Power', 'Upgrade Costs',
])

// ------------------------------------------------------------- Regressions

test('Colossus: two story missions apart, then the Array and The Citadel jointly on top', () => {
  const groups = groupRows(bossPlaybook('colossus').where)
  assert.deepEqual(groups.mission.map(row => row.report), ['colossus-iron-citadel-armory', 'colossus-fallen-ember-warhead'])
  assert.deepEqual(groups.mission.map(row => row.mission), ['operation-iron-citadel', 'operation-fallen-ember'])
  const leaders = groups.seen.filter(row => row.rank.startsWith('1'))
  assert.deepEqual(leaders.map(row => row.report), ['colossus-cheonwang-peak-array-gate', 'colossus-the-citadel'])
  for (const row of leaders) {
    assert.equal(row.rank, '1=', row.where)
    assert.equal(row.words, 'Joint most reported', row.where)
    assert.equal(row.seen, leaders[0].seen, row.where)
  }
  assert.deepEqual(topRows(bossPlaybook('colossus').where).slice(0, 2).map(row => row.report), leaders.map(row => row.report))
})

test('Deathstalker: NuriGO Mall and the DBN roof are joint', () => {
  const leaders = groupRows(bossPlaybook('deathstalker').where).seen.filter(row => row.rank.startsWith('1'))
  assert.deepEqual(leaders.map(row => row.report), ['deathstalker-nurigo-mall', 'deathstalker'])
  for (const row of leaders) assert.deepEqual([row.rank, row.words], ['1=', 'Joint most reported'], row.where)
})

test('the tank report stands on DMZ Codex alone and stays Reported', () => {
  const report = hajinReports.find(item => item.id === 'tank')
  assert.equal(report.confidence, 'reported')
  assert.deepEqual(report.sources, ['dmzcodex-tank'])
  const row = bossPlaybook('main-nk-battle-tank').where.find(item => item.report === 'tank')
  assert.deepEqual(row.sources, ['dmzcodex-tank'])
  assert.equal(rowConfidence(row), 'reported')
})

test('The Citadel Colossus report never mentions the wilderness', () => {
  const report = hajinReports.find(item => item.id === 'colossus-the-citadel')
  const row = bossPlaybook('colossus').where.find(item => item.report === 'colossus-the-citadel')
  for (const text of [report.where, report.note, row.where, row.note]) assert.doesNotMatch(text || '', /wilderness/i)
})

test('no recipe row points at or mentions Wolves Stadium', () => {
  const recipeRows = [...findRows, ...recipesNoPlace]
  for (const row of recipeRows) {
    const pin = rowTarget(row)?.pin
    const anchor = hajinReports.find(report => report.id === pin)?.anchor || pin
    assert.notEqual(anchor, 'wolves-stadium', row.where || row.name)
  }
  assert.doesNotMatch(JSON.stringify([recipePlaybooks, recipeHotspots, recipesNoPlace, BARRACKS]), /wolves[\s-]*stadium/i)
})

test('the two dropped videos appear nowhere', () => {
  const files = [...['shared', 'app', 'scripts', 'public/spotlight'].flatMap(filesIn), 'desktop-app/renderer/nav.js']
  assert.ok(files.includes('app/data/searchIndex.json'))
  assert.deepEqual(files.filter(file => /7mfeaoinqzm|woxbb1vkr7w/i.test(read(file))), [])
})

// ------------------------------------------------------------- Ranks

test('rankWords gives competition ranks, words only for a clear lead, and flags single reports', () => {
  const ranked = rankWords(seenRows([3, 3, 2, 1]))
  assert.deepEqual(ranked.map(row => row.rank), ['1=', '1=', '3', '4'])
  assert.deepEqual(ranked.map(row => row.words), ['Joint most reported', 'Joint most reported', null, null])
  assert.deepEqual(ranked.map(row => row.chance), [false, false, false, true])
  assert.deepEqual(rankWords(seenRows([5, 3])).map(row => [row.rank, row.words]), [['1', 'Most reported'], ['2', null]])
  assert.deepEqual(rankWords(seenRows([4, 3])).map(row => row.words), [null, null])
  assert.deepEqual(rankWords(seenRows([3, 2, 2, 1, 1])).map(row => row.rank), ['1', '2=', '2=', '4=', '4='])
  assert.equal(rankWords(seenRows([5, 3]), 'find')[0].words, 'Most finds')
  assert.equal(rankWords(seenRows([2, 2]), 'find')[0].words, 'Joint most finds')
  // Rows come back sorted, as copies.
  const input = seenRows([1, 3])
  const output = rankWords(input)
  assert.deepEqual(output.map(row => row.where), ['Place 2', 'Place 1'])
  assert.ok(output.every(row => !input.includes(row)))
  assert.ok(input.every(row => !('rank' in row)))
})

test('only seen and unplaced rows are ranked, each among its own kind', () => {
  const mixed = [
    { kind: 'scripted', where: 'Scripted', seen: 3, sources: [] },
    { kind: 'mission', where: 'Mission', seen: 8, sources: [] },
    ...seenRows([3, 2, 2, 1]),
    { kind: 'unplaced', where: 'Unplaced', seen: 4, sources: [] },
    { kind: 'listed', where: 'Listed', sources: [] },
  ]
  assert.deepEqual(rankWords(mixed).map(row => [row.kind, row.rank]), [['seen', '1'], ['seen', '2='], ['seen', '2='], ['seen', '4'], ['unplaced', '1']])
  const groups = groupRows(mixed)
  assert.deepEqual(groups.mission.map(row => row.where), ['Scripted', 'Mission'])
  assert.deepEqual(groups.seen.map(row => row.rank), ['1', '2=', '2=', '4'])
  assert.deepEqual(groups.unplaced.map(row => [row.rank, row.words]), [['1', null]])
  assert.deepEqual(groups.listed.map(row => row.where), ['Listed'])
  // topRows keeps a tie together rather than cut it.
  assert.equal(topRows(mixed, 1).length, 1)
  assert.equal(topRows(mixed, 2).length, 3)
  assert.equal(topRows(mixed, 3).length, 3)
})

test('row helpers: count labels, targets, video times and source totals', () => {
  assert.deepEqual([countLabel(1), countLabel(3), countLabel(1, 'find'), countLabel(14, 'find')], ['1 report', '3 reports', '1 find', '14 finds'])
  assert.deepEqual(rowTarget({ report: 'tank' }), { pin: 'tank' })
  assert.deepEqual(rowTarget({ pin: 'nurigo-mall' }), { pin: 'nurigo-mall' })
  assert.deepEqual(rowTarget({ layer: 'police' }), { layer: 'police' })
  assert.equal(rowTarget({ where: 'The last objective of a Dynamic Op' }), null)
  const at = new URL(videoUrl('youtube-ap6kpzmgau8', '1:57'))
  assert.deepEqual([at.searchParams.get('v'), at.searchParams.get('t')], ['Ap6kPZMGAu8', '117s'])
  assert.equal(new URL(videoUrl(anySource('youtube-ap6kpzmgau8'), '1:02:03')).searchParams.get('t'), '3723s')
  assert.equal(videoUrl('youtube-ap6kpzmgau8'), anySource('youtube-ap6kpzmgau8').url)
  // A copy counts as the page it copies, and clips from one set count once.
  const family = ['allthings-how-to-beat-the-colossus', 'xboxplay-colossus', 'fanboydestroy-colossus']
  assert.equal(independentReports(family), 1)
  assert.equal(sourcesSummary(family), '3 pages · 2 copy another')
  assert.equal(sourcesSummary(['dmzcodex-tank']), '1 page')
  assert.equal(independentReports(['youtube-muogab_gdgq', 'youtube-knfiaw6w_4m']), 1)
  assert.equal(rowConfidence({ sources: family }), 'reported')
  assert.equal(rowConfidence({ sources: ['allthings-how-to-beat-the-colossus', 'gamespot-hot-spots'] }), 'confirmed')
  assert.equal(rowConfidence({ sources: ['callofduty-call-of-duty-modern-warfare'] }), 'official')
})

// ------------------------------------------------------------- Rows and videos

test('sightings rows follow one shape and point at real places', () => {
  const reportIds = new Set(hajinReports.map(report => report.id))
  const intelIds = new Set(dmzIntel.map(entry => entry.id))
  assert.ok(reportRows.length >= 15 && findRows.length >= 25)
  for (const row of rows) {
    const name = row.where
    assert.ok(KINDS.includes(row.kind), `${name}: kind ${row.kind}`)
    assert.ok(name && row.sources?.length, name)
    assert.ok(['report', 'pin', 'layer'].filter(field => row[field]).length <= 1, `${name} has more than one target`)
    if (row.report) assert.ok(reportIds.has(row.report), `${name}: report ${row.report}`)
    if (row.pin) assert.ok(hajinPin(row.pin), `${name}: pin ${row.pin}`)
    if (row.layer) assert.ok(hajinLayer(row.layer), `${name}: layer ${row.layer}`)
    if (row.mission) assert.ok(intelIds.has(row.mission), `${name}: mission ${row.mission}`)
    if (row.square) assert.match(row.square, /^[A-J][1-9]$/, name)
    if (row.kind === 'listed') assert.equal(row.seen, undefined, `${name}: listed rows have no count`)
    else assert.ok(Number.isInteger(row.seen) && row.seen > 0, `${name}: seen ${row.seen}`)
    for (const id of row.sources) assert.ok(anySource(id)?.url, `${name}: source ${id}`)
  }
})

test('a video counts toward a row only when it names the place', () => {
  const withVideos = [...rows, ...recipesNoPlace].filter(row => row.videos?.length)
  assert.ok(withVideos.length >= 5)
  for (const row of withVideos) {
    for (const video of row.videos) assert.equal(row.sources.includes(video.id), video.shows === true, `${row.where || row.name}: ${video.id}`)
  }
  for (const row of reportRows.filter(item => item.seen)) {
    assert.ok(row.seen <= independentReports(row.sources), `${row.where}: ${row.seen} seen from ${independentReports(row.sources)} independent pages`)
  }
})

test('copies point at a real page and never loop', () => {
  const copies = allSources.filter(source => source.copyOf)
  assert.ok(copies.length >= 8)
  for (const source of copies) {
    assert.ok(anySource(source.copyOf)?.url, `${source.key} copies ${source.copyOf}`)
    const visited = new Set([source.key])
    let key = source.copyOf
    while (anySource(key).copyOf) {
      assert.ok(!visited.has(key), `${source.key}: copyOf loops at ${key}`)
      visited.add(key)
      key = anySource(key).copyOf
    }
  }
  for (const source of allSources.filter(item => 'same' in item)) assert.ok(typeof source.same === 'string' && source.same, source.key)
})

test('rates stay out of row and loot text, and every claim is marked unchecked', () => {
  for (const text of ['40%', '40 percent', 'about a third of runs', 'most of the time']) assert.match(text, NO_PERCENT)
  const text = strings([bossPlaybooks.map(({ lead, note, where }) => ({ lead, note, where })), recipePlaybooks, recipeHotspots, recipesNoPlace, runSamples, BARRACKS])
  assert.ok(text.length > 200)
  assert.deepEqual(text.filter(line => NO_PERCENT.test(line)), [])
  const loot = [...lootReports.flatMap(lootReportText), ...lootCards.flatMap(lootCardText)].filter(Boolean)
  assert.ok(lootReports.length >= 7 && lootCards.length >= 11 && loot.length > 60, `${lootReports.length} reports, ${lootCards.length} cards, ${loot.length} lines`)
  assert.deepEqual(loot.filter(line => typeof line !== 'string'), [])
  assert.deepEqual(loot.filter(line => NO_PERCENT.test(line)), [])
  const claims = rows.flatMap(row => row.claims || [])
  assert.ok(claims.length)
  for (const claim of claims) {
    assert.ok(claim.text, 'a claim has no text')
    assert.equal(claim.checked, false, claim.text)
  }
})

// ------------------------------------------------------------- Video labels

test('YouTube sources carry neutral labels', () => {
  assert.ok(videos.length >= 160)
  for (const { key, label, type } of videos) {
    assert.equal(type, 'video', key)
    assert.doesNotMatch(label, /[|@#]|\bft\.|\bfeat\./i, key)
    assert.doesNotMatch(label, /\p{Extended_Pictographic}/u, `${key}: ${label}`)
    assert.deepEqual((label.match(/[A-Z]{4,}/g) || []).filter(run => !ACRONYMS.includes(run)), [], `${key}: ${label}`)
    assert.ok(label.length <= 90, `${key}: ${label.length} characters`)
  }
})

test('each YouTube video is registered once, and this round\'s were uploaded 20 to 24 Oct 2026', () => {
  const ids = videos.map(source => youtubeId(source.url))
  assert.ok(ids.every(Boolean), 'a YouTube URL has no video id')
  assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), [])
  const byId = new Map(videos.map(source => [youtubeId(source.url), source]))
  assert.equal(new Set(ROUND_VIDEOS).size, ROUND_VIDEOS.length)
  for (const id of ROUND_VIDEOS) {
    const source = byId.get(id)
    assert.ok(source, `${id} is not registered`)
    assert.equal(source.key, `youtube-${id.toLowerCase()}`, id)
    assert.ok(source.date >= '2026-10-20' && source.date <= '2026-10-24', `${id}: ${source.date}`)
  }
})

test('every Watch it done link resolves to a video source', () => {
  const refs = [...videoRefs([bossPlaybooks, recipePlaybooks, recipeHotspots, recipesNoPlace, BARRACKS, guideTiers, hajinReports]), ...LIEUTENANT_VIDEOS, ...STUCK_VIDEOS]
  assert.ok(refs.length >= 40)
  for (const ref of refs) {
    assert.equal(anySource(ref.id)?.type, 'video', ref.id)
    assert.ok(ref.why, `${ref.id} has no why line`)
    if (ref.at) assert.match(ref.at, /^(\d+:)?\d{1,2}:\d{2}$/, ref.id)
    if ('shows' in ref) assert.equal(ref.shows, true, ref.id)
  }
})

// ------------------------------------------------------------- Sources

test('no seller pages, and no label carries a byline or username', () => {
  for (const source of allSources) {
    assert.doesNotMatch(`${source.key} ${source.url || ''}`, /skycoach|timesaver|upblazed|playerauctions/i, source.key)
    const label = source.label || ''
    const tail = label.match(/\(([^()]+)\)\s*$/)?.[1]
    if (tail && PERSON.test(tail)) assert.ok(NOT_BYLINES.has(tail), `${source.key}: '(${tail})' reads like a byline`)
    assert.doesNotMatch(label, /\bby [A-Z][a-z'’-]+(?: [A-Z]\.)? [A-Z][a-z'’-]+\b|@|(^|\s)\/?u\/\w/, `${source.key}: ${label}`)
  }
})

test('guide sources do not repeat a map report source', () => {
  const mapPages = new Map(Object.entries(mapReportSources).map(([key, source]) => [pageOf(source.url), key]))
  const repeats = Object.entries(guideSources).filter(([, source]) => mapPages.has(pageOf(source.url))).map(([key, source]) => `${key} repeats ${mapPages.get(pageOf(source.url))}`)
  assert.deepEqual(repeats, [])
  assert.deepEqual(Object.keys(guideSources).filter(key => key in mapReportSources), [])
})

// ------------------------------------------------------------- Freshness and wording

test('sightings go stale only once a later patch is logged', () => {
  assert.equal(sightingsStale(), null)
  const line = sightingsStale([...dmzIntel, { id: 'patch-26-oct-2026', category: 'dates', name: 'Patch', added: '2026-10-26' }])
  assert.equal(typeof line, 'string')
  assert.match(line, /26 Oct/)
})

test('the Colossus lead calls the Array the lower-threat place, and no lead says best', () => {
  const lead = bossPlaybook('colossus').lead
  assert.match(lead, /Array is the lower-threat place/)
  assert.equal(hajinPin('cheonwang-peak-array').threat, 'Medium')
  assert.equal(hajinPin('fortress-the-citadel').threat, 'Critical')
  for (const book of bossPlaybooks.filter(item => item.lead)) assert.doesNotMatch(book.lead, /\bbest\b/i, book.id)
})

test('world recipes have find rows or say none is published', () => {
  for (const id of RECIPES_WITHOUT_SPOT) {
    assert.deepEqual(recipeSpotLine(id), { kind: 'none', text: 'No find published yet (checked 24 Oct)' })
    assert.ok(!recipePlaybooks[id]?.rows?.length, id)
  }
  const world = printerRecipes.filter(entry => /^Find the recipe in Hajin/.test(recipeUnlock(entry) || ''))
  assert.ok(world.length >= 15)
  for (const entry of world) assert.ok(recipePlaybooks[entry.id]?.rows?.length || RECIPES_WITHOUT_SPOT.includes(entry.id), entry.id)
  for (const entry of printerRecipes.filter(item => !world.includes(item))) assert.equal(recipeSpotLine(entry.id), null, entry.id)
})

test('the sightings components take their date from SIGHTINGS_CHECKED', () => {
  for (const file of ['DmzSightings', 'DmzRecipeSpots', 'DmzVideoGuides'].map(name => `app/components/dmz/${name}.vue`)) {
    assert.doesNotMatch(read(file), /\b20\d\d\b|\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, file)
  }
  assert.match(read('app/components/dmz/DmzSightings.vue'), /SIGHTINGS_CHECKED/)
})
