import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = new URL('../docs/remaining-games/', import.meta.url)
const manifest = JSON.parse(fs.readFileSync(new URL('assets.json', root), 'utf8'))
for (const id of ['asset-1540', 'asset-1541', 'asset-1582', 'asset-1589', 'asset-1682', 'asset-1813', 'asset-1814', 'asset-1817', 'asset-1822', 'asset-1845', 'asset-0025', 'asset-1650', 'asset-1651', 'asset-1652', 'asset-1653', 'asset-1654', 'asset-1655', 'asset-1656', 'asset-1657']) {
  const asset = manifest.assets.find(item => item.id === id)
  if (asset.localPath) continue
  const response = await fetch(asset.source)
  if (!response.ok) throw new Error(`${id}: ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const localPath = `assets/${asset.gameId}/additional/${id}.webp`
  fs.mkdirSync(new URL(`assets/${asset.gameId}/additional/`, root), { recursive: true })
  fs.writeFileSync(new URL(localPath, root), bytes)
  Object.assign(asset, { localPath, status: 'downloaded', bytes: bytes.length, mimeType: response.headers.get('content-type'), sha256: crypto.createHash('sha256').update(bytes).digest('hex') })
  console.log(`${id}: ${bytes.length} bytes`)
}
fs.writeFileSync(new URL('assets.json', root), JSON.stringify(manifest, null, 2) + '\n')
