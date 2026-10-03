export const rooms = ['Armory', 'Department Store', 'Dragon Command', 'Supply Depot', 'Infirmary', 'Tank Factory']
export const roomSlug = room => room.toLowerCase().replaceAll(' ', '-')
export const bombLocations = {
  Armory: 'Ground floor, beside Wunderfizz.',
  'Department Store': 'Ground floor, behind the stairs.',
  'Dragon Command': 'Left balcony, beside the Mystery Box location.',
  'Supply Depot': 'Ground-floor wall near the entrance.',
  Infirmary: 'Beside the brick column at the Operations Bunker stairs.',
  'Tank Factory': 'To the left of the GobbleGum machine.'
}
// Crops use the original screenshot as an SVG image. No invented replacement glyphs.
const crop = (id, label, box) => ({ id, label, box })
export const shadowGlyphs = [
  crop('s1', 'Lower-left star', [1140, 755, 82, 80]),
  crop('s2', 'Left fork', [1140, 692, 82, 74]),
  crop('s3', 'Left middle glyph', [1155, 622, 80, 74]),
  crop('s4', 'Upper-left glyph', [1195, 574, 75, 76]),
  crop('s5', 'Top glyph', [1244, 545, 80, 78]),
  crop('s6', 'Upper-right glyph', [1290, 573, 83, 75]),
  crop('s7', 'Right middle glyph', [1324, 622, 82, 73]),
  crop('s8', 'Right fork', [1335, 687, 83, 76]),
  crop('s9', 'Lower-right glyph', [1335, 746, 84, 76])
]
export const voidNames = ['Heart', 'Door', 'Griffon', 'Stag', 'Horn', 'Crown']
export const voidGlyphs = [
  crop('ribbon', 'Ribbon', [1608, 10, 238, 160]), crop('claw', 'Claw', [1618, 180, 185, 191]),
  crop('spikes', 'Spikes', [1610, 376, 207, 164]), crop('arms', 'Arms', [1573, 538, 218, 176]),
  crop('tears', 'Tears', [1572, 719, 252, 170]), crop('moon', 'Moon', [1588, 891, 219, 180])
]
export const terminalGlyphs = [
  crop('circle', 'Circle', [1165, 662, 50, 56]), crop('bolt', 'Lightning bolt', [1234, 662, 50, 56]),
  crop('d', 'D shape', [1332, 662, 50, 56]), crop('rocket', 'Rocket', [1400, 662, 50, 56])
]
const plantImage = (file, alt) => ({ src: `/images/bo3-zetsubou-no-shima/zns-${file}`, alt })
export const plantSupplies = [
  { name: 'A bucket', image: plantImage('bucket-icon.png', 'The metal bucket inventory icon.'), instruction: 'Pick one up at spawn, either lab or the bunker. Hold interact at a water pool to fill it; check the colour in your inventory.' },
  { name: 'A seed', image: plantImage('seed-icon.png', 'The spiky seed dropped by zombies.'), instruction: 'Kill zombies until one drops a seed, then collect it. At an empty circular stone planter, interact to plant the seed.' }
]
export const plantPlanter = plantImage('planting-ring.jpg', 'An ordinary circular stone planter with a grown pod. Find an empty ring like this to plant your seed.')
export const plantWaters = {
  Blue: {
    location: 'Behind Lab A · near the spider cave',
    directions: ['Go behind Lab A to the pool beside the webbed entrance to the giant spider cave.', 'With a bucket, hold interact at the pool. Check that the bucket icon turns blue.'],
    images: [plantImage('blue-water.webp', 'Blue water: the pool behind Lab A, beside the webbed cave entrance.')]
  },
  Green: {
    location: 'Below Lab B · beside the sewer exit',
    directions: ['Look below and behind Lab B, close to where the sewer slide comes out. The pool sits under the wooden shelter.', 'Hold interact at the pool with your bucket. Check that the bucket icon turns green.'],
    images: [plantImage('green-water.jpg', 'Green water: the pool under the wooden shelter below Lab B.')]
  },
  Purple: {
    location: 'Inside the bunker · spider cocoon room',
    directions: ['Enter the bunker and take the door to the right of the central Pack-a-Punch area into the room full of hanging cocoons.', 'Find the purple pool near the torn poster. Hold interact with your bucket and check its colour.'],
    images: [plantImage('purple-water.jpg', 'Purple water: the glowing pool in the bunker’s spider cocoon room.')]
  },
  Rainbow: {
    location: 'Sewer slide · lower bunker → Lab B',
    directions: ['Bring a bucket and 500 points to the sewer entrance near the KT-4 workbenches in the lower bunker, opposite Mule Kick.', 'Ride toward Lab B. Hold interact as you pass the glowing Element 115 rock on the right, circled in the photo. The collection window is brief.', 'Check that your bucket now shows Rainbow water. If it did not change, ride again and adjust your timing. An ordinary bucket works.'],
    images: [plantImage('sewer-pipe-fast-travel.webp', 'Start at this sewer entrance in the lower bunker and travel toward Lab B.'), plantImage('rainbow-water-rock.jpg', 'Collect while passing the rock circled on the right. This is a timed pickup during the sewer ride.')]
  }
}
export const plantRecipes = {
  flak: {
    name: 'Anti-aircraft shell', water: ['Blue','Blue','Blue'], shots: true,
    purpose: 'Main quest: load this shell into the artillery cannon to shoot down the plane and recover an elevator cog.',
    needs: 'A seed, a bucket of blue water, and KT-4 or Masamune.',
    place: 'Any ordinary circular stone planter.',
    result: 'Harvest for a chance at a flak shell. Grow several plants in parallel; another reward is possible.',
    link: { anchor: 'plants', label: 'Shell and plane step' }
  },
  fruit: {
    name: 'Fruit / eat-a-fruit trial', water: ['Blue','Green','Purple'], shots: false,
    purpose: 'Use this if your personal trial asks you to eat a fruit. Fruit can also give a bonus perk or make you vomit.',
    needs: 'A seed and a bucket. Visit each of the three coloured pools over three rounds.',
    place: 'Any ordinary circular stone planter.',
    result: 'Three different colours, in any order, give a chance of fruit. If another plant grows, start again with a new seed.',
    link: { anchor: 'skull', label: 'Personal trials and the Skull' }
  },
  holder: {
    name: 'Hold a zombie alive', water: ['Green','Green','Green'], shots: false,
    purpose: 'Optional: keep a zombie occupied while you work on other steps. Avoid shooting the zombie held by the plant.',
    needs: 'A seed and a bucket of green water.', place: 'Any ordinary circular stone planter.',
    result: 'A mature green plant can catch and hold a nearby zombie. Return to check on it while doing other steps.'
  },
  killer: {
    name: 'Killing plant', water: ['Purple','Purple','Purple'], shots: false,
    purpose: 'Optional: grow a plant that attacks nearby zombies. Keep it away from the last zombie if you need to save the round.',
    needs: 'A seed and a bucket of purple water.', place: 'Any ordinary circular stone planter.',
    result: 'The mature purple plant attacks nearby zombies. Leave it in place to do its work.'
  },
  imprint: {
    name: 'Imprint / saved loadout', water: ['Blue','Blue','Blue'], shots: true,
    purpose: 'Optional: an imprint plant can save your current equipment and perks and restore that snapshot after you die.',
    needs: 'A seed, a bucket and KT-4 or Masamune. Blue is a simple repeatable route; green or purple water can also work.',
    place: 'Any ordinary circular stone planter.',
    result: 'An imprint is a chance reward. If one grows, interact with it to save your loadout before you need the revive.',
    link: { anchor: 'gardening', label: 'Imprints and other plant rewards' }
  },
  masamune: {
    name: 'Masamune quest plant', water: ['Rainbow','Rainbow','Rainbow'], shots: false,
    purpose: 'KT-4 upgrade: grow the underwater ingredient needed to build Masamune.',
    needs: 'A seed, a bucket and the Skull of Nan Sapwe. First Mesmerize the torn poster beside the purple pool, then the hidden wall in the deep underwater cave.',
    place: 'Secret planter behind that hidden wall, in the deepest cave where you found the original KT-4 plant. An ordinary planter will not grow this ingredient.',
    result: 'Harvest the quest ingredient on the fourth round from the revealed underwater planter.',
    link: { anchor: 'equipment', label: 'KT-4, Masamune and the hidden planter' }
  }
}
const loc = (region, file, text) => ({ region, text, src: `/images/bo3-revelations/revelations-${file}.webp` })
export const revelationLocations = {
  egg: [
    loc('Spawn / Shangri-La','shangri-la-egg-first-spawn','Fire pit at the foot of the Shangri-La stairs.'),
    loc('Spawn / Shangri-La','shangri-la-egg-second-spawn','Window just left of Stamin-Up.'),
    loc('Spawn / Shangri-La','shangri-la-egg-third-spawn','Trash can left of the stairs to the Shangri-La jump pad.'),
    loc('Spawn / Shangri-La','shangri-la-egg-final-spawn','Barrel by spawn’s jump pad toward Origins.'),
    loc('Kino / Der Eisendrache','kino-egg-first-spawn','Floor along the Bowie Knife path.'),
    loc('Kino / Der Eisendrache','kino-egg-second-spawn','Corner of Kino’s upper balcony, right of the stage.'),
    loc('Kino / Der Eisendrache','kino-egg-third-spawn','Bucket to the right of Wunderfizz in the connecting tunnel.'),
    loc('Kino / Der Eisendrache','kino-egg-final-spawn','At the feet of the Primis statues.'),
    loc('Verrückt','verruckt-egg-first-spawn','Left of the path into the building.'),
    loc('Verrückt','verruckt-egg-second-spawn','Blue-lit debris above the Speed Cola stairs.'),
    loc('Verrückt','verruckt-egg-third-spawn','Between the green test-subject tanks.'),
    loc('Verrückt','verruckt-egg-final-spawn','Right side near Wunderfizz and the chairs.'),
    loc('Origins / Mob','motd-egg-first-spawn','Cells before the corruption engine.'),
    loc('Origins / Mob','motd-egg-second-spawn','Near the KN-44 in the connecting area.'),
    loc('Origins / Mob','motd-egg-third-spawn','Left of Wunderfizz on the excavation mound.'),
    loc('Origins / Mob','motd-egg-final-spawn','Rocks left of the Vesper, near the Keeper altar.')
  ],
  rune: [
    loc('Spawn / Shangri-La','spawn-rune-first-spawn','Ground by the jump pad toward Origins.'),
    loc('Spawn / Shangri-La','spawn-rune-second-spawn','Left of Quick Revive.'),
    loc('Spawn / Shangri-La','spawn-rune-final-spawn','Ground near the jump pad toward Shangri-La.'),
    loc('Kino / Der Eisendrache','shangri-la-rune-first-spawn','Panel next to Stamin-Up in Shangri-La.'),
    loc('Kino / Der Eisendrache','shangri-la-rune-second-spawn','By the Primis statues.'),
    loc('Kino / Der Eisendrache','shangri-la-rune-final-spawn','A pressure plate by the pyramid.'),
    loc('Verrückt','verruckt-rune-first-spawn','Fence in the old power room.'),
    loc('Verrückt','verruckt-rune-second-spawn','Right of the test-subject tanks.'),
    loc('Verrückt','verruckt-rune-final-spawn','Path toward the Kino jump pad.'),
    loc('Origins / Mob','motd-rune-first-spawn','Fallen board at the cafeteria entrance.'),
    loc('Origins / Mob','motd-rune-second-spawn','Near the Generator 3 doorway.'),
    loc('Origins / Mob','motd-rune-final-spawn','Opposite the KN-44, beneath the lamp.')
  ],
  bone: [
    loc('Spawn / Shangri-La','spawn-bone','Broken church window at spawn.'), loc('Spawn / Shangri-La','shangri-la-bone','Stonework above Stamin-Up.'),
    loc('Origins / Mob','origins-bone','Outside the map near the giant robot footprint.'), loc('Kino / Der Eisendrache','der-eisendrache-bone','Third wall of the exterior free-perk wall-run route.'),
    loc('Nacht','nacht-bone','Wall above the Der Eisendrache portal.'), loc('Verrückt','verruckt-bone','Rock beside the waterfall.')
  ],
  relic: [
    loc('Spawn / Shangri-La','shangri-la-relic','Convergence crystal in the palm tree left of the temple.'),
    loc('Verrückt','verruckt-relic','MG42 on the fountain outside the building.'),
    loc('Origins / Mob','motd-relic','Poster in the cell beside the corruption-engine area.'),
    loc('Nacht','nacht-relic','Red barrel outside the window by the spawn portal.'),
    loc('Origins / Mob','origins-relic','Tombstone on scaffolding left of Wunderfizz at the mound.'),
    loc('Kino / Der Eisendrache','der-eisendrache-relic','Clock above the pyramid area.'),
    loc('Kino / Der Eisendrache','kino-relic','Radio on the chandelier above Kino’s seating.')
  ]
}
export const collectionActions = {
  egg: 'After placing the Kronorium on Kino’s podium, find an egg, take it to an acid-pool incubator inside the Apothicon and supply its souls yourself. Carry the hatched gateworm to hunt a rune.',
  rune: 'Carry a gateworm. Follow its beeps and interact where they are fastest, then collect the revealed rune. One rune is recovered in each region.',
  bone: 'Shoot the stone with a Pack-a-Punched bullet weapon to release a bone, then absorb the floating bone with the upgraded Apothicon Servant.',
  relic: 'After the four trial arenas, throw the Summoning Key at the target. A successful hit gives an audio/visual cue. Retrieve the key before moving on.'
}
