import fs from 'node:fs'
// Authoring rules reviewed against the existing published object labels.
// These enrich identity only; coordinates, legacy categories and target IDs stay intact.
const ids=['ashes-of-the-damned','astra-malorum','paradox-junction','totenreich','kowakujo','rex-infernus','mw3-urzikstan','mw3-dark-aether-season-1','mw3-dark-aether-season-2','mw3-dark-aether-season-3','mw3-dark-aether-season-5']
const labelRules=[
 [/^Pack[- ]a[- ]Punch\b/i,'pack-a-punch'],[/^Arsenal\b/i,'arsenal'],[/^Der Wunderfizz\b/i,'wunderfizz'],
 [/^Door Buy\b/i,'door-buy'],[/^Exfil\b|exit\b/i,'exfil'],[/^Fast Travel\b/i,'fast-travel'],[/^Aether Tear\b/i,'portal'],
 [/^Teleporter\b/i,'teleporter'],[/^Zipline\b/i,'zipline'],[/^Ammo Cache\b/i,'ammo-cache'],[/^Mystery Box\b/i,'mystery-box'],
  [/\bAmmo Cache$/i,'ammo-cache'],[/^Mars · Armor Wall Buy$/i,'armor-buy'],[/^Fuel station\b/i,'fuel-station'],
  [/^(Final|Ordinary) exfil\b/i,'exfil'],[/^Entry landing\b/i,'entry-point'],[/^Power Door\b/i,'door-buy'],
  [/^Rune portal\b|^Season [1-5] — /i,'portal'],[/^Redeploy drone\b|^Ninja Kite\b/i,'fast-travel'],
 [/^Armor (Wall Buy|Vest)\b/i,'armor-buy'],[/^Crafting Table\b/i,'crafting-table'],[/^Gobblegum\b/i,'gobblegum'],
 [/^Dig Spot\b/i,'dig-site'],[/^Deadbolt turret\b/i,'turret'],[/^Doghouse\b/i,'doghouse'],[/^Gas station\b/i,'fuel-station'],
 [/^Rampage Inducer\b/i,'challenge-starter'],[/^Void Claw Pedestal\b/i,'quest-mechanism'],[/^Fishing Spot\b/i,'fishing-site'],
]
const counts={}
for(const id of ids){
 const file=`app/data/maps/${id}.json`,data=JSON.parse(fs.readFileSync(file,'utf8'))
 const rewards=new Set(id==='mw3-urzikstan'?data.targets.find(t=>t.id==='free-perks')?.locationIds:[])
 for(const loc of data.locations){
  const rule=labelRules.find(([pattern,type])=>pattern.test(loc.label) && (type !== 'exfil' || loc.category === 'travel'))
  loc.typeId=loc.perkType==='mister-peeks'?'cursed-peeks':rewards.has(loc.id)?'perk-reward':rule?.[1]||(loc.category==='area'?'named-area':loc.category==='perk'?'perk-machine':loc.category==='weapon'?'wall-buy':loc.category)
  if(/^(keys-|usb-key-|loc-image-|obelisk-urzi-)/.test(loc.id))loc.typeId=loc.id.startsWith('keys-')?'key':loc.id.startsWith('loc-image-')?'clue':loc.id.startsWith('usb-key-')?'quest-mechanism':'challenge-starter'
  if(/possible|candidate|changes|random|not every|spawn/i.test(loc.state||''))loc.availability='candidate'
  else if(loc.state)loc.availability='conditional'
  else loc.availability='unknown'
  counts[loc.typeId]=(counts[loc.typeId]||0)+1
 }
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n')
}
fs.writeFileSync('docs/map-expansion-research/existing-type-review.json',JSON.stringify({reviewed:'2026-10-11',scope:ids,notes:'Physical label rules only. Unresolved legacy quest/equipment/travel types retain generic identities; no new geographic or availability certainty is inferred.',counts},null,2)+'\n')
console.log(JSON.stringify(counts))
