import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
export function materializeRemainingImages(authored) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/remaining-games/assets.json'), 'utf8'))
  const byId = new Map(manifest.assets.map(asset => [asset.id, asset]))
  const bySrc = new Map(manifest.assets.filter(asset => asset.localPath).map(asset => [`/images/remaining/${asset.id}${path.extname(asset.localPath)}`, asset.id]))
  const used = new Set()
  function visit(value) {
    if (typeof value === 'string' && bySrc.has(value)) used.add(bySrc.get(value))
    else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') { if (value.assetId) used.add(value.assetId); Object.values(value).forEach(visit) }
  }
  visit(authored)
  const directory = path.join(root, 'public/images/remaining')
  fs.mkdirSync(directory, { recursive: true })
  const output = []
  for (const id of [...used].sort()) {
    const asset = byId.get(id)
    if (!asset?.localPath) throw new Error(`Referenced image is unavailable: ${id}`)
    const source = path.resolve(root, 'docs/remaining-games', asset.localPath)
    if (!source.startsWith(path.resolve(root, 'docs/remaining-games/assets') + path.sep)) throw new Error(`Invalid asset path: ${id}`)
    const target = path.join(directory, id + path.extname(source))
    if (!fs.existsSync(target) || fs.statSync(target).size !== fs.statSync(source).size) fs.copyFileSync(source, target)
    const previewSource = path.join(root, 'docs/remaining-games/assets/previews', id + '.webp')
    if (fs.existsSync(previewSource)) {
      fs.mkdirSync(path.join(directory, 'preview'), { recursive: true })
      const previewTarget = path.join(directory, 'preview', id + '.webp')
      if (!fs.existsSync(previewTarget) || fs.statSync(previewTarget).size !== fs.statSync(previewSource).size) fs.copyFileSync(previewSource, previewTarget)
    }
    output.push({ id, src: `/images/remaining/${path.basename(target)}`, credit: asset.credit, source: asset.page, rightsStatus: asset.rightsStatus, bytes: fs.statSync(target).size })
  }
  const report = { purpose: 'Selected instructional references for local implementation. Credits do not establish publication permission.', count: output.length, bytes: output.reduce((sum, asset) => sum + asset.bytes, 0), assets: output }
  const reportPath = path.join(root, 'app/data/remainingImages.json')
  const serialized = JSON.stringify(report, null, 2) + '\n'
  if (!fs.existsSync(reportPath) || fs.readFileSync(reportPath, 'utf8') !== serialized) fs.writeFileSync(reportPath, serialized)
  return report
}
