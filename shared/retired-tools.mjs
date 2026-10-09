// These activities belong in the guide. Keep old bookmarks useful without
// instantiating a retired helper or touching its saved browser observations.
export const retiredTools = {
  'mw3-rune-portals': '/guides/mw3-urzikstan#details-rune-portals',
  'mw3-red-worm-usbs': '/guides/mw3-urzikstan#details-red-worm',
  'mw3-dark-aether-reference': '/guides/mw3-urzikstan#details-dark-aether-portals',
  'mw3-union-runes': '/guides/mw3-dark-aether-season-3#details-crystals',
  'bo3-verruckt-setup': '/guides/bo3-verruckt#details-setup',
  'bo3-ascension-luna': '/guides/bo3-ascension#details-luna',
  'bo3-origins-staffs': '/guides/bo3-origins#details-staff-build',
  'bo3-de-bows': '/guides/bo3-der-eisendrache#details-bows',
  'bo3-shadows-roles': '/guides/bo3-shadows-of-evil#details-finale',
  'bo3-zetsubou-upgrades': '/guides/bo3-zetsubou-no-shima#details-equipment',
  'bo3-giant-secrets': '/guides/bo3-the-giant#details-flytrap',
  'cw-firebase-memories': '/guides/cw-firebase-z#details-memories',
  'cw-forsaken-neutralizer': '/guides/cw-forsaken#details-parts',
  'bo4-blood-trials': '/guides/bo4-blood-of-the-dead#details-birds',
  'bo4-blood-skulls': '/guides/bo4-blood-of-the-dead#details-blundergat',
  'bo4-ix-danu': '/guides/bo4-ix#details-danu',
  'bo4-ancient-theater': '/guides/bo4-ancient-evil#details-theater',
  'bo4-tag-challenges': '/guides/bo4-tag-der-toten#details-charges',
  'bo6-liberty-aetherella': '/guides/bo6-liberty-falls#details-aetherella',
  'bo6-liberty-vault': '/guides/bo6-liberty-falls#details-vault',
  'bo6-terminus-nathan': '/guides/bo6-terminus#details-hard-drive',
  'bo6-citadelle-knights': '/guides/bo6-citadelle-des-morts#details-knights',
  'bo6-tomb-trials': '/guides/bo6-the-tomb#details-trials',
  'bo6-tomb-vases': '/guides/bo6-the-tomb#details-vases'
}

export function retiredToolDestination(pathname) {
  const match = pathname.match(/^\/tools\/([\w-]+)(?:\.html)?\/?$/)
  return match ? retiredTools[match[1]] || null : null
}
