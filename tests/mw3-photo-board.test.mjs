import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { redWormPhotoAtlas, normalizeBoardPhotos, photoTargetId, photosFromTarget, photoMapTarget } from '../app/utils/mw3PhotoBoard.mjs'
import { mapAnchor, mapTargetFromAnchor, decodeGuideHash } from '../app/utils/mapNavigation.mjs'
const data = JSON.parse(fs.readFileSync('app/data/maps/mw3-urzikstan.json'))

test('all twelve original board photos resolve to their independently checked landmark pins', () => {
  // Transcribed from the source chart's numbered overview, not the pin array order.
  const expected = [
    ['usb-key-m2603', 'C1'], ['usb-key-m2597', 'F3'], ['usb-key-m2596', 'I2'], ['usb-key-m2575', 'C4'],
    ['usb-key-m2625', 'F4'], ['usb-key-m2599', 'G4'], ['usb-key-m2598', 'F5'], ['usb-key-m2606', 'I5'],
    ['usb-key-m2595', 'D6'], ['usb-key-m2594', 'F7'], ['usb-key-m2604', 'D8'], ['usb-key-m2605', 'H8'],
  ]
  assert.equal(redWormPhotoAtlas.photos.length, 12)
  assert.equal(new Set(redWormPhotoAtlas.photos.map(photo => photo.locationId)).size, 12)
  for (const [index, photo] of redWormPhotoAtlas.photos.entries()) {
    assert.equal(photo.number, index + 1)
    assert.deepEqual([photo.locationId, photo.grid], expected[index])
    const pin = data.locations.find(location => location.id === photo.locationId)
    assert.equal(pin.grid, photo.grid)
    assert.match(pin.state, /selection changes each deployment/)
    const crop = photo.crop
    assert.ok(crop.x >= 0 && crop.y >= 0 && crop.x + crop.width <= redWormPhotoAtlas.width && crop.y + crop.height <= redWormPhotoAtlas.height)
    assert.equal(crop.width, 300)
    assert.equal(crop.height, 262)
    assert.equal(crop.sourceWidth, 1440)
    assert.equal(crop.sourceHeight, 3440)
  }
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public' + redWormPhotoAtlas.image)).digest('hex'), redWormPhotoAtlas.sha256, 'The source image changed; review every crop before updating the atlas')
})

test('all 495 possible four-photo boards share and resolve without assigning drive identities', () => {
  let boards = 0
  for (let a = 1; a <= 9; a++) for (let b = a + 1; b <= 10; b++) for (let c = b + 1; c <= 11; c++) for (let d = c + 1; d <= 12; d++) {
    const numbers = [a, b, c, d], id = photoTargetId(numbers)
    assert.deepEqual(photosFromTarget(mapTargetFromAnchor(decodeGuideHash('#' + encodeURIComponent(mapAnchor(id))))), numbers)
    const target = photoMapTarget(id)
    assert.equal(target.kind, 'photo-match')
    assert.deepEqual(target.locationIds, numbers.map(number => redWormPhotoAtlas.photos[number - 1].locationId))
    assert.match(target.description, /do not assign USB letters/)
    boards++
  }
  assert.equal(boards, 495)
})

test('malformed links cannot silently become a different board and saved values stay bounded', () => {
  for (const id of ['', null, {}, 'red-worm-photos-', 'red-worm-photos-0', 'red-worm-photos-13', 'red-worm-photos-1-1', 'red-worm-photos-1-2-3-4-5', 'red-worm-photos-01', 'red-worm-photos-1<script>', 'usb-key-m2603']) assert.equal(photosFromTarget(id), null)
  assert.deepEqual(photosFromTarget('red-worm-photos-12-1-5-9'), [1, 5, 9, 12])
  assert.deepEqual(normalizeBoardPhotos([null, '1', -1, 2.5, 0, 13, 4, 4, 1, 12, 5, 6]), [1, 4, 5, 12])
  assert.deepEqual(normalizeBoardPhotos({ photos: [1, 2] }), [])
  assert.equal(photoTargetId([]), '')
})

test('MW3 activities cover the original map index with independently selectable quest types', () => {
  for (const file of fs.readdirSync('app/data/maps').filter(file => file.startsWith('mw3-'))) {
    const map = JSON.parse(fs.readFileSync('app/data/maps/' + file))
    assert.ok(map.filterGroups.length)
    const covered = new Set(map.locations.filter(location => location.overview).map(location => location.id))
    assert.equal(new Set(map.filterGroups.map(group => group.id)).size, map.filterGroups.length)
    for (const group of map.filterGroups) {
      assert.ok(group.filters.some(filter => filter.id === group.defaultFilter))
      assert.equal(new Set(group.filters.map(filter => filter.id)).size, group.filters.length)
      for (const filter of group.filters) {
        assert.ok(filter.label && filter.locationIds.length)
        assert.equal(new Set(filter.locationIds).size, filter.locationIds.length)
        for (const id of filter.locationIds) { assert.ok(map.locations.some(location => location.id === id)); covered.add(id) }
      }
    }
    assert.equal(covered.size, map.locations.length)
    if (map.id !== 'mw3-urzikstan') {
      const starters = map.filterGroups.find(group => group.id === 'quests').filters.find(filter => filter.id === 'contract-starters')
      assert.equal(starters.locationIds.length, 3)
      assert.ok(starters.locationIds.every(id => /^(contracts|obelisk)-m/.test(id)))
    }
  }
  const worm = data.filterGroups.find(group => group.id === 'red-worm')
  assert.deepEqual(worm.filters.map(filter => [filter.id, filter.locationIds.length]), [['clue-boards', 4], ['usb-devices', 12], ['fight-arenas', 4]])
  const unstable = data.filterGroups.find(group => group.id === 'unstable-rift')
  assert.equal(unstable.filters[0].locationIds.length, 54)
  assert.ok(unstable.filters[0].locationIds.every(id => id.startsWith('obelisk-urzi-')))
})
