// Rebuild Cold War maps from the pinned, MIT-licensed DECLASSIFIED snapshots.
// This is a constrained text parser: upstream JavaScript is never evaluated.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const root = process.cwd();
const research = path.join(root, 'docs/map-expansion-research');
const sourceRoot = path.join(research, 'cw-source');
const assetRoot = path.join(research, 'assets/declassified');
const commit = 'e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0';
const upstream = `https://github.com/Miss-placed/DECLASSIFIED/blob/${commit}/`;
const layouts = [
  ['cw-die-maschine', 'Die Maschine', 'dieMaschine', 'surface', 'Surface and Nacht', 'dieMaschine/dieMaschine.svg'],
  ['cw-die-maschine', 'Die Maschine', 'dieMaschineUnderground', 'underground', 'Underground facility', 'dieMaschine_underground/dieMaschine_underground.svg'],
  ['cw-firebase-z', 'Firebase Z', 'firebaseZSpawn', 'village', 'Village', 'firebaseZ_spawn/firebaseZ_spawn.svg'],
  ['cw-firebase-z', 'Firebase Z', 'firebaseZ', 'firebase', 'Firebase', 'firebaseZ/firebaseZ.svg'],
  ['cw-mauer-der-toten', 'Mauer der Toten', 'mauerDerTotenStreets', 'streets', 'Streets and rooftops', 'mauerDerToten_streets/mauerDerToten_streets.svg'],
  ['cw-mauer-der-toten', 'Mauer der Toten', 'mauerDerToten', 'underground', 'Underground', 'mauerDerToten/mauerDerToten.svg'],
  ['cw-forsaken', 'Forsaken', 'forsaken', 'surface', 'Town and observation tower', 'forsaken/forsaken.svg'],
  ['cw-forsaken', 'Forsaken', 'forsakenUnderground', 'underground', 'Underground facility', 'forsaken_underground/forsaken_underground.svg'],
  ...['ruka', 'alpine', 'golova', 'sanatorium', 'duga', 'zoo', 'collateral', 'armada'].map(id =>
    ['cw-outbreak', 'Outbreak', id, id, id[0].toUpperCase() + id.slice(1), `${id}/${id === 'ruka' ? 'Ruka' : id}.svg`]),
];
const layoutBySource = Object.fromEntries(layouts.map(row => [row[2], row]));
const text = file => fs.readFile(path.join(sourceRoot, `src__data__${file}.tsx`), 'utf8');
const sources = Object.fromEntries(await Promise.all(['types', 'perks', 'misc', 'wallbuys', 'mainQuest', 'easterEggs'].map(async key => [key, await text(key)])));
const stringPattern = String.raw`(?:\x60(?:\\.|[^\x60\\])*\x60|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")`;
function stringValue(value) {
  if (!value || !['"', "'", '`'].includes(value.trim()[0])) return null;
  const body = value.trim().slice(1, -1);
  if (body.includes('${')) throw new Error('Dynamic string rejected');
  return body.replace(/\\([nrt\\'"`])/g, (_, c) => ({ n: '\n', r: '\r', t: '\t' }[c] ?? c));
}
function field(value, key) {
  const match = value.match(new RegExp(`\\b${key}\\s*:\\s*(${stringPattern})`));
  return match ? stringValue(match[1]) : '';
}
function split(value) {
  const out = []; let start = 0; let depth = 0; let quote = ''; let escape = false;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === quote) quote = ''; continue; }
    if ('\'"`'.includes(c)) quote = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { out.push(value.slice(start, i).trim()); start = i + 1; }
  }
  out.push(value.slice(start).trim()); return out;
}
const meta = {};
for (const [file, data] of Object.entries(sources)) {
  for (const match of data.matchAll(/(\w+):\s*new Item\(\{([\s\S]*?)\}\)/g)) {
    meta[`${file}:${match[1]}`] = { title: field(match[2], 'title'), desc: field(match[2], 'desc') };
  }
}
const records = []; const rejected = [];
for (const file of ['misc', 'perks', 'wallbuys', 'mainQuest', 'easterEggs']) {
  let sourceMap = '';
  for (const [lineIndex, line] of sources[file].split(/\r?\n/).entries()) {
    const mapMatch = line.match(/^\s*\[MapIds\.(\w+)\]:\s*\[/);
    if (mapMatch) sourceMap = mapMatch[1];
    if (!layoutBySource[sourceMap] || !line.includes('new MiscMarker(')) continue;
    const args = split(line.slice(line.indexOf('new MiscMarker(') + 15, line.lastIndexOf(')')));
    const [idText, ref, coordText, optional = ''] = args;
    const id = stringValue(idText); const type = ref.split('.').at(-1);
    if (!/^\[\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\]$/.test(coordText)) { rejected.push({ file, sourceMap, id, reason: 'No literal point' }); continue; }
    const loc = JSON.parse(coordText);
    if (loc.every(n => n === 0) || loc.some(n => n < 0 || n > 512)) { rejected.push({ file, sourceMap, id, reason: 'Placeholder or out-of-bounds point' }); continue; }
    const base = meta[`${ref.startsWith('MiscTypes.') ? 'types' : file}:${type}`];
    if (!base?.title) throw new Error(`Missing metadata: ${file}:${ref} (${id})`);
    records.push({ id, sourceMap, file, type, loc, title: field(optional, 'uniqueTitle') || base.title,
      description: [base.desc, field(optional, 'uniqueDesc')].filter(Boolean).join('\n'),
      linkedItems: field(optional, 'linkedItems'), source: `${upstream}src/data/${file}.tsx#L${lineIndex + 1}` });
  }
}
await fs.writeFile(path.join(sourceRoot, 'parsed-records.json'), JSON.stringify(records, null, 2) + '\n');
await fs.writeFile(path.join(sourceRoot, 'rejected-records.json'), JSON.stringify(rejected, null, 2) + '\n');
console.log(JSON.stringify({ parsed: records.length, rejected: rejected.length, byMap: Object.fromEntries(layouts.map(row => [row[2], records.filter(r => r.sourceMap === row[2]).length])) }, null, 2));

// Source SVGs are self-contained, and their geometry is kept byte-for-byte.
// Inject only credit/accessibility metadata, not transformations or new paths.
const license = await fs.readFile(path.join(assetRoot, 'LICENSE'), 'utf8');
const manifest = [];
for (const [id, name, sourceMap, layer, label, relative] of layouts) {
  const input = await fs.readFile(path.join(assetRoot, 'public/legacy/maps', relative), 'utf8');
  if (!input.includes('viewBox="0 0 512 512"')) throw new Error(`Unexpected viewBox: ${relative}`);
  const output = input.replace(/(<svg\b[^>]*>)/, `$1\n<title>${name} — ${label}</title>\n<desc>Layout by DECLASSIFIED / Odinn H and Ben Ashley. MIT licensed. Some overlapping floors share a schematic layer.</desc>\n<!--\n${license.replaceAll('--', '—')}\nSource: ${upstream}public/legacy/maps/${relative}\n-->`);
  const dir = path.join(root, 'public/maps', id); await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${layer}.svg`), output);
  await fs.writeFile(path.join(dir, 'LICENSE.txt'), license);
  manifest.push({ dataset: id, sourceMap, layer, image: `/maps/${id}/${layer}.svg`, source: `${upstream}public/legacy/maps/${relative}`, originalSha256: crypto.createHash('sha256').update(input).digest('hex') });
}
await fs.writeFile(path.join(sourceRoot, 'layout-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

export { root, research, sourceRoot, assetRoot, layouts, layoutBySource, records, upstream, manifest, createRequire };
