// These activities belong in the guide. Keep old bookmarks useful without
// instantiating a retired helper or touching its saved browser observations.
export const retiredTools = {
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
