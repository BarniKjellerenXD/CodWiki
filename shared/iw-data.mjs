// Source-reviewed factual puzzle tables. Mechanics are implemented independently.
// Provenance: docs/remaining-games/puzzle-data.json and sources.json.
export const morseDigits = ['-----','.----','..---','...--','....-','.....','-....','--...','---..','----.']
export const shaolinWords = ['ACTORS','AFTERLIFE','ANCESTOR','ARCADE','ARTHUR','AUDITION','BASEMENT','BEVERLYHILLS','BLACKCAT','BOAT','BREEDER','BROADWAY','BRUTE','BUMPERCARS','CHARMS','COMICBOOKS','CRANE','CRYPTID','DANCE','DAVIDARCHER','DEATH','DIRECTOR','DISCO','DRAGON','DRCROSS','FAIRIES','FORGEFREEZE','GEYSER','GHETTO','HARPOON','HIVES','INFERNO','KATANA','KEVINSMITH','KRAKEN','KUNGFU','LOSANGELES','MCINTOSH','MEMORIES','MEPHISTOPHELES','NEWYORK','NIGHTFALL','NUNCHUCKS','OBELISK','OCTONIAN','PAMGRIER','PINKCAT','PUNKS','RATKING','REALITYTV','REDWOODS','ROLLERCOASTER','ROLLERSKATES','SAMANTHA','SAVAGEMADETHIS','SHAOLIN','SHIELD','SHUFFLE','SIXTYMILLION','SLASHER','SLIDE','SNAKE','SPACELAND','STAFF','SUBWAY','TIGER','TREES','WEREWOLFPOETS','WINONAWYLER','YETIEYES','ZAPPER']
export const diskRows = [[1,2,3,4,0,5],[6,5,8,9,7,1],[9,10,7,8,6,1],[9,4,3,0,5,2],[1,11,3,2,0,5],[4,11,0,2,5,8]]
export const chemicalRaw = {
  vodka: ['Vodka','Market liquor shelf','Spawn'], pennies: ['Pennies','Crowbar the Market cash register','Market rear'], quarters: ['Quarters','Crowbar a Gas Station payphone','Market rear'],
  'racing-fuel': ['Racing Fuel','Outside Gas Station','Spawn'], fat: ['Fat','Cleaver the left hanging meat in Market freezer','Beach'], paint: ['Paint','Behind the shack near Racin’ Stripes','RV Park'],
  detergent: ['Detergent','Market left shelf','Spawn'], 'drain-opener': ['Drain Opener','RV restroom toilet','Market rear'], ice: ['Ice','Crowbar the Market ice machine','RV Park'],
  'glass-cleaner': ['Glass Cleaner','Market right shelf','Market rear'], vinegar: ['Vinegar','Market backroom table','RV Park'], 'baking-soda': ['Baking Soda','Market middle shelf','Spawn'],
  'wheel-cleaner': ['Wheel Cleaner','Market middle shelf','Beach'], 'motor-oil': ['Motor Oil','Gas Station garage floor','Beach'], 'insect-repellent': ['Insect Repellent','Spawn hallway table','Spawn'],
  'nail-polish-remover': ['Nail Polish Remover','Motel office desk','Market rear'], 'plant-food': ['Plant Food','Snack Shack left side','RV Park']
}
const recipe = (label, ingredients, board = null, final = false) => ({ label, ingredients, board, final })
export const chemicalRecipes = {
  acetaldehyde: recipe('Acetaldehyde',['vodka','pennies'],'TV Station'), formaldehyde: recipe('Formaldehyde',['quarters','racing-fuel'],'Gas Station'),
  hexamine: recipe('Hexamine',['glass-cleaner','formaldehyde'],'Gas Station'), 'aldehyde-sludge': recipe('Aldehyde Sludge',['acetaldehyde','formaldehyde','detergent'],'Gas Station'),
  methylbenzene: recipe('Methylbenzene',['paint','detergent','drain-opener'],'TV Station'), dinitro: recipe('Dinitro',['detergent','baking-soda','vinegar','methylbenzene'],'Gas Station'),
  glycerol: recipe('Glycerol',['fat','vodka'],'TV Station'), 'mixed-acid': recipe('Mixed Acid',['ice','detergent','drain-opener'],'TV Station'),
  'nitrated-glycerol': recipe('Nitrated Glycerol Solution',['glycerol','mixed-acid'],'TV Station'), phenol: recipe('Phenol',['wheel-cleaner','motor-oil','insect-repellent'],'Gas Station'),
  'phenolsulfonic-acid': recipe('Phenolsulfonic Acid',['phenol','drain-opener'],'Gas Station'),
  'octa-hydro': recipe('Octa-hydro-2,5-nitro-3,4,7-para-zokine',['hexamine','vinegar','detergent','plant-food'],null,true),
  'di-nitroxy': recipe('3,4-di-nitroxy-methyl-propane',['aldehyde-sludge','nail-polish-remover'],null,true),
  'tetra-nitro-phenol': recipe('1,3,5 tera-nitro-phenol',['phenolsulfonic-acid','detergent'],null,true),
  'di-nitrobenzene': recipe('3-methyl-2,4-di-nitrobenzene',['dinitro','racing-fuel'],null,true),
  'tetra-nitrite': recipe('2,4-propane-3,5-tetra-nitrite',['nitrated-glycerol','baking-soda'],null,true)
}
export const chemicalFinals = Object.keys(chemicalRecipes).filter(id => chemicalRecipes[id].final)
export const chemicalLabel = id => chemicalRaw[id]?.[0] || chemicalRecipes[id]?.label || id
export const skullWords = ['ALDEHYDES','ALLOMER','BENZENE','CHLORINATION','ETHERS','ETHYL','HYDROGENATION','NEUTRINO','NITRILES','OXIDATION','REDUCTION','SOLVOLYSIS','SUBLIMATION','ZWITTERION']
export const souvenirRecipes = {
  RRR: 'Medusa Device', RRB: 'Fireworks Trap', RBB: 'Laser Window Trap', BBB: 'Sentry Turret', RGG: 'Sentry Turret',
  RRG: 'Boombox', GGB: 'Boombox', GBB: 'Electric Trap', GGG: 'Revocator', RGB: 'Kindle Pops'
}
