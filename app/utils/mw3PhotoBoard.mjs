import { redWormPhotoAtlas } from '../../shared/mw3-photo-board.mjs'
export { redWormPhotoAtlas }
export const PHOTO_BOARD_KEY = 'codwiki-mw3-red-worm-photos-v1'

export function normalizeBoardPhotos(raw) {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter(number => Number.isInteger(number) && number >= 1 && number <= 12))].slice(0, 4).sort((a, b) => a - b)
}
export function photoTargetId(raw) {
  const numbers = normalizeBoardPhotos(raw)
  return numbers.length ? `red-worm-photos-${numbers.join('-')}` : ''
}
export function photosFromTarget(id) {
  if (typeof id !== 'string' || !/^red-worm-photos-(?:[1-9]|1[0-2])(?:-(?:[1-9]|1[0-2])){0,3}$/.test(id)) return null
  const numbers = id.slice('red-worm-photos-'.length).split('-').map(Number)
  return new Set(numbers).size === numbers.length ? numbers.sort((a, b) => a - b) : null
}
export function photoMapTarget(id) {
  const numbers = photosFromTarget(id)
  if (!numbers) return undefined
  return {
    id: photoTargetId(numbers), title: `Board ${numbers.length === 1 ? 'photo' : 'photos'} ${numbers.join(', ')}`,
    kind: 'photo-match', guideAnchor: 'guide-step-mw3-usb-collect',
    description: 'These consoles match your selected photographs. Read Alpha, Bravo, Charlie or Delta when collecting each drive; photo numbers do not assign USB letters.',
    locationIds: numbers.map(number => redWormPhotoAtlas.photos[number - 1].locationId),
  }
}
