import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'))

test('curated homepage artwork resolves to real maps and credited local responsive assets',()=>{
 const catalogue=read('shared/catalogue.json'),art=read('app/data/mapArtwork.json'),manifest=read('docs/home-artwork.json')
 const known=new Set(catalogue.maps.map(m=>m.id))
 const assets=new Map(manifest.assets.map(a=>[a.src,a]))
 assert.equal(assets.size,manifest.assets.length,'Each artwork path has one provenance record')
 for(const [id,image]of Object.entries(art)){
  assert.ok(known.has(id),id)
  const asset=assets.get(image.src)
  assert.ok(asset?.maps.includes(id),id)
  assert.ok(asset.source&&asset.credit,id)
  for(const src of [image.src,...(image.srcset||'').split(',').map(s=>s.trim().split(' ')[0]).filter(Boolean)]){
   assert.ok(src.startsWith('/images/'),src)
   const bytes=fs.readFileSync('public'+src)
   assert.ok(bytes.length>3000,src)
   assert.equal(bytes.toString('ascii',0,4),'RIFF',src)
  }
 }
 assert.ok(art['bo3-shadows-of-evil'].src.includes('shadows-of-evil'))
 assert.notEqual(art['bo1-ascension'].src,art['bo3-ascension'].src,'Distinct edition images must not overwrite one another')
})
