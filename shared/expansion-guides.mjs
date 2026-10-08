import { coldWarGuides } from './cold-war-guides.mjs'
import { guides as aetherGuides } from './bo4-alpha-tag.mjs'
import { guides as nightGuides } from './bo4-night-classified.mjs'
import { guides as chaosGuides } from './bo4-ix-ancient.mjs'
import { bloodOfTheDead } from './blood-of-the-dead.mjs'
import { voyage } from './bo4-voyage.mjs'
import { bo6Guides } from './bo6-guides.mjs'
import { bo3Guides } from './bo3-guides.mjs'
import { chroniclesGuides } from './chronicles-guides.mjs'
import { bo2Guides } from './bo2-guides.mjs'
import { classicGuides } from './classic-guides.mjs'
export { games } from './games.mjs'
// Concise walkthroughs adapted from the linked community sources with AI assistance.
// Stable phase/step IDs are generated from the explicit keys, never from prose.
const reddit = slug => `https://www.reddit.com/r/CODZombies/wiki/${slug}/`
const phase = (id, title, steps, tools = []) => ({ id, title, steps: steps.map((step, i) => typeof step === 'string' ? { id: `${id}-${i + 1}`, text: step } : { id: `${id}-${i + 1}`, ...step }), tools })
const guide = (id, gameId, name, intro, phases, sources, extra = {}) => ({ id, gameId, name, intro, phases, sources, reviewed: '2026-09-30', ...extra })
const baseGuides = [
  ...bo6Guides,
  ...coldWarGuides,
  guide('bo3-origins', 'bo3', 'Origins', 'Zombies Chronicles version. Build and upgrade all four staffs for the main quest. Older Origins pages also contain BO2 material; the source links are references, not a claim that every old weapon or shortcut exists in BO3.', [
    phase('setup', 'Key Features: generators and equipment', [
      'Activate the six generators by staying within their capture areas and defeating the attacking templars. All six must be powered to use Pack-a-Punch.',
      'Collect shield parts around the generator routes and build it at a workbench. Take a shovel from a starting location and dig marked sites for equipment.',
      'Collect the gramophone in the excavation and the black record near the mound. Place the gramophone to open the lower excavation, then retrieve it for the elemental tunnels.',
      'Each staff needs its colored record, three parts and the crystal from its matching Crazy Place portal. Leave the portal open until you return, then recover the gramophone.'
    ]),
    phase('staff-build', 'Build the four staffs', [
      'Ice: dig glowing excavation sites while it is snowing, searching the spawn, middle and church regions for its three parts. Take the blue record from the Tank Station area and obtain the ice crystal through the church tunnel.',
      'Fire: collect the part dropped by a Panzer, shoot down the glowing plane and collect its drop, and take the Generator 6 reward part. Find the red record around the church and obtain the fire crystal.',
      'Wind: enter each giant robot through its lit foot by shooting the panel before it steps down. Collect one part inside each robot, find the yellow record around Generator 5 and obtain the wind crystal.',
      'Lightning: use the tank to reach all three elevated part locations; plan the jump before riding past each platform. Find the purple record near Generator 4 and obtain the lightning crystal.',
      'Return to the excavation pedestals and build each staff. Collect its crystal before trying to assemble it.'
    ]),
    phase('upgrades', 'Upgrade all four staffs', [
      'Ice: match each shown tablet to its ceiling symbol in the Crazy Place. Use the linked source chart when identifying shapes. Back on the map, freeze the three tombstones, then break each with a bullet weapon.',
      'Fire: kill zombies on the Crazy Place grates with the staff until the cauldrons light. Decode the glowing church symbols into torch numbers and light the corresponding torches with the fire staff.',
      'Wind: set the Crazy Place rings to the wind pattern shown in the reference guide, then redirect the three smoking stone balls toward the excavation with the staff.',
      'Lightning: number the seven lower keyboard triangles from left to right. Shoot 1–3–6, wait for the sparks to clear, then 3–5–7, wait, then 2–4–6. Ignore the upper row. Rotate the sparking electrical panel switches around the map until they stop sparking.',
      'For each staff, align the excavation rings to its color, shoot the orb beneath them, then place the staff in its Crazy Place pedestal and feed it kills until charged. Retrieve the upgraded staff.'
    ], ['bo3-origins-ice', 'bo3-origins-fire', 'bo3-origins-staffs']),
    phase('equipment', 'Thunder Fists, G-Strikes and drone', [
      'Fill all four soul chests in the robot footprints without letting a robot reset an unfinished chest. Collect the Thunder Fists from a reward chest.',
      'Take a tablet from the Tank Station to the church water basin. Earn nearby melee kills to clean it, then carry it back without touching mud. If it becomes dirty, return to the basin and try again.',
      'Place the clean tablet back in the Tank Station and earn the required melee kills to unlock G-Strikes. Build the Maxis Drone from its three parts.'
    ]),
    phase('seal', 'Robot pedestals and the seal', [
      'Place upgraded staffs in the quest pedestals: ice in the church robot, wind in the middle robot, lightning in the spawn robot, and fire in the excavation.',
      'After the placement step completes, retrieve the staffs. Press a robot’s red button and quickly throw a G-Strike onto the sealed ground near Generator 5. In co-op, assign the button and throw to separate players.',
      'Once the seal opens, deploy the Maxis Drone into it. Defeat the spawned Panzers before continuing.'
    ]),
    phase('finale', 'Pilot and Crazy Place finale', [
      'Use Zombie Blood to see and shoot the glowing plane, then locate and kill its pilot while the effect is active. Collect the drone it drops.',
      'In the lower excavation, use melee attacks on the special smoke-trailing zombies until the upgraded-fist tablet appears; collect it.',
      'Place all four upgraded staffs in the Crazy Place and feed the final soul requirement. When the portal opens, deploy the upgraded Maxis Drone and use the final interaction to finish the quest.'
    ])
  ], [reddit('origins')], { group: 'chronicles' }),
  nightGuides.find(g => g.id === 'bo4-dead-of-the-night'),


  chaosGuides.find(g => g.id === 'bo4-ix'),
  voyage,
  bloodOfTheDead,



  chaosGuides.find(g => g.id === 'bo4-ancient-evil'),
  aetherGuides.find(g => g.id === 'bo4-alpha-omega'),
  aetherGuides.find(g => g.id === 'bo4-tag-der-toten'),

  nightGuides.find(g => g.id === 'bo4-classified'),
  guide('bo3-ascension', 'bo3', 'Ascension', 'Zombies Chronicles. The unmodded Casimir Mechanism quest requires four players and synchronized actions.', [
    phase('setup', 'Key Features: landers and rocket', ['Turn on power and use all three lunar lander stations. Launch the rocket to reach Pack-a-Punch.', 'Prepare Gersh Devices, Matryoshka Dolls and upgraded high-damage weapons for the final orb stage. Coordinate equipment across the team.']),
    phase('nodes', 'First three Casimir nodes', ['Throw a Gersh Device at the generator outside the playable area near the PhD/Widow’s Wine side, then activate the monitor by the Stamin-Up lander.', 'During a monkey round, assign all four players to the four perk-area buttons and press them together.', 'With Pack-a-Punch open, stand together on the platform beneath the rocket for one full clock rotation without leaving it.']),
    phase('luna', 'LUNA lander route', ['Keep one rider aboard while teammates call the lander: Spawn → Stamin-Up, Stamin-Up → Spawn, Spawn → Speed Cola, Speed Cola → Stamin-Up.', 'Collect the letters along those flights to spell LUNA and activate the fourth node.'], ['bo3-ascension-luna']),
    phase('orb', 'Final orb', ['At the Casimir device near Stamin-Up, use a Gersh Device at the glowing orb and apply the required explosive/wonder-weapon damage as a team.', 'Continue until the orb rises and the quest confirmation plays. This quest has its own reward rather than a conventional boss arena.'])
  ], [reddit('ascension'), 'https://steamcommunity.com/sharedfiles/filedetails?id=2446771284'], { group: 'chronicles' }),
  guide('bo3-shangri-la', 'bo3', 'Shangri-La', 'Zombies Chronicles. Four players are required to activate Eclipse and coordinate the main quest. A failed Eclipse attempt is not necessarily a whole-round failure.', [
    phase('setup', 'Key Features: power and Eclipse', ['Activate both underground power switches. Coordinate the pressure plates for Pack-a-Punch access and obtain the 31-79 JGb215.', 'Assign players to the four spawn buttons and press them together to enter Eclipse. Re-enter Eclipse for stages that require it.']),
    phase('tiles', 'Tile matching and water slide', ['Divide the tile areas between players. Reveal symbols, record positions on both sides and step on matching pairs in coordination.', 'For the water-slide sequence, arrange three players at the bottom while the final player completes the lever/slide interaction. Confirm the step succeeds before moving on.'], ['bo3-shang-tiles']),
    phase('trials', 'Meteor, Napalm and dials', ['Use the baby gun and slide route for the meteor step. Complete the Napalm zombie gas-leak route without killing the required zombie too early.', 'Use Spikemores for the tunnel-hole step, then complete the stone-symbol and mud-dial interactions using their reference patterns.', 'Listen to the gongs and identify the correct resonance before the focusing-stone interaction.']),
    phase('stone', 'Focusing stone', ['Complete the final Eclipse actions and open the route to the focusing stone. Coordinate the team’s positioning before collecting it.', 'A player’s reward and any repeated run for additional rewards should be tracked separately; reset only the relevant quest checklist.'])
  ], [reddit('shangri-la'), 'https://steamcommunity.com/sharedfiles/filedetails/?id=2461194923'], { group: 'chronicles' }),
  guide('bo3-moon', 'bo3', 'Moon', 'Zombies Chronicles supports the full quest solo. Original BO1 prior-quest requirements do not apply to this version. PES and Hacker occupy the same equipment slot.', [
    phase('setup', 'Key Features: oxygen and equipment', ['Escape Area 51 to the Moon, collect a PES and restore power. Use the Hacker carefully: without a PES you need breathable areas.', 'Prepare the Wave Gun, Gersh Devices and QEDs as the quest requires. Keep access to Tunnel 6 for the sphere stage.']),
    phase('simon', 'Samantha Says and terminals', ['Complete the first Samantha Says sequence at the four screens by repeating each display in order.', 'Use the Hacker for the laboratory terminal/button stage and finish its timed interactions.', 'Wait for Excavator Pi to breach Tunnel 6, then stop the excavator with the Hacker when the quest’s tunnel condition has been satisfied.'], ['bo3-moon-simon']),
    phase('sphere', 'Sphere and MPD', ['Follow the sphere through Tunnel 6, using the appropriate weapon interactions and Wave Gun satellite shot to move it onward.', 'Guide the sphere into the MPD, then fill the required soul stage to open the chamber.', 'Return to Area 51 for the plates. Use the Gersh/QED interactions to move them into place and find the cable for the Vril device/computer sequence.']),
    phase('rockets', 'Canisters and rockets', ['Complete the device/computer stage and fill the four soul canisters. Keep the team supplied while moving between the charge areas.', 'Repeat the later Samantha Says sequences, clearing the helper for each attempt. Finish the final sphere/device interactions to launch the rockets.'], ['bo3-moon-simon'])
  ], [reddit('moon'), 'https://steamcommunity.com/sharedfiles/filedetails/?id=2373011651'], { group: 'chronicles' }),
  guide('bo3-nacht-der-untoten', 'bo3', 'Nacht der Untoten', 'Zombies Chronicles setup and secrets. There is no ordinary power switch or Pack-a-Punch quest on this map.', [
    phase('setup', 'Key Features: rooms and equipment', ['Choose which staircase and Help-room routes to open based on the team’s training space. Leaving a route closed changes how zombies reach the upper floor.', 'Use the Mystery Box and Wunderfizz for equipment. The scoped cabinet weapon and perk options differ from the original World at War version.']),
    phase('samantha', 'Samantha secret', ['Find and activate the four small Samantha buttons around the map. Listen for the success cue, then interact with the starting doll.', 'Shoot the appearing dolls through the sequence, following their sound and sightlines. Collect the reward after completion.'], ['bo3-nacht-secrets']),
    phase('extras', 'Useful extras', ['The radio is a separate music interaction. Keep it separate from the Samantha buttons and do not expect it to unlock a main quest.', 'Use the source’s images for small button and doll sightlines; the helper tracks completed stages, not unseen target positions.'])
  ], [reddit('nacht-der-untoten')], { group: 'chronicles', questLabel: 'Setup and secrets' }),
  guide('bo3-verruckt', 'bo3', 'Verrückt', 'Zombies Chronicles. Players can begin on opposite sides of the asylum and remain separated until the power route is opened.', [
    phase('setup', 'Key Features: split spawns', ['Identify whether you started on the Jugger-Nog or Quick Revive side. Open that side’s upstairs route toward the power room.', 'Turn on power to reconnect the starting halves. Coordinate purchases so both sides retain enough space and ammunition.', 'Use the map’s traps and BO3 equipment options. Do not apply the original version’s Mystery Box contents automatically.'], ['bo3-verruckt-setup']),
    phase('secrets', 'Samantha and music secrets', ['Perform the toilet interaction sequence to start the Chronicles Samantha secret, then follow the doll sequence and collect its reward.', 'Use the toilet/music interaction separately when playing the map’s song. Listen for the cue before repeating an interaction.'])
  ], [reddit('verruckt')], { group: 'chronicles', questLabel: 'Setup and secrets' }),
  guide('bo3-shi-no-numa', 'bo3', 'Shi No Numa', 'Zombies Chronicles. This guide does not describe the Vanguard main quest or mobile-only weapon secrets.', [
    phase('setup', 'Key Features: huts and perks', ['Open the central route and choose a hut to explore. Record the perk revealed at each hut; locations are randomized between matches.', 'Use the Flogger and avoid becoming trapped in the slowing water. Keep an escape route when opening a new hut.', 'Obtain the Wunderwaffe from the BO3 weapon pool if desired; there is no Vanguard-style build quest here.'], ['bo3-shi-perks']),
    phase('secrets', 'Samantha and telephone secrets', ['Shoot the four pans for the Chronicles Samantha activation, then follow the bridge/doll sequence and collect the reward.', 'Interact with the telephone for the map’s music secret. This is independent of hut perk assignments.'])
  ], [reddit('shi-no-numa')], { group: 'chronicles', questLabel: 'Setup and secrets' }),
  guide('bo3-kino-der-toten', 'bo3', 'Kino der Toten', 'Zombies Chronicles setup and secrets. The main practical route is power, teleporter linking and Pack-a-Punch.', [
    phase('setup', 'Key Features: stage and teleporter', ['Open a route from the lobby to the stage and switch on power. Link the teleporter at the stage and then the mainframe in the lobby.', 'Use the linked teleporter for the Pack-a-Punch room. Watch the return timing and finish purchases before being moved onward.', 'Collect film reels from the intermission rooms and use the projector when available.']),
    phase('secrets', 'Meteorites and Samantha knocks', ['Interact with the three meteorite fragments to activate the music secret.', 'For the Chronicles Samantha sequence, listen to the three groups of knocks and record each count. Repeat the observed pattern at the interaction point.', 'Continue the resulting doll sequence and collect its reward. Clear the knock recorder for a new attempt rather than appending an old pattern.'], ['bo3-kino-knocks'])
  ], [reddit('kino-der-toten')], { group: 'chronicles', questLabel: 'Setup and secrets' }),
]
export const expansionGuides = [...baseGuides.filter(g => g.gameId !== 'bo3'), ...bo3Guides, ...chroniclesGuides, ...bo2Guides, ...classicGuides, ...iwGuides, ...ww2Guides, ...awGuides, ...vanguardGuides, ...mw3Guides]
import { iwGuides } from './iw-guides.mjs'
import { ww2Guides } from './ww2-guides.mjs'
import { awGuides } from './aw-guides.mjs'
import { vanguardGuides } from './vanguard-guides.mjs'
import { mw3Guides } from './mw3-guides.mjs'
