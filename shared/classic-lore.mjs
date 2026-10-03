import {phase,step,photos} from './classic-common.mjs'
export const classicLore={
 'bo1-ascension':{sources:['https://callofduty.fandom.com/wiki/Ascension/Radios','https://www.reddit.com/r/CODZombies/comments/v67lei/'],phases:[
  phase('recordings','Six story radios and the ringing telephones',[
   step('ascension-radios','Use the six story radios in this order, allowing each message to finish before visiting the next. They tell Yuri and Gersh’s story independently of the main quest.','Listen to the six radios in order.',{bullets:['1. Left of the stairs to PhD Flopper, between the concrete barricades.','2. Past Stamin-Up, in the crate behind the truck.','3. Downstairs in Spawn, between the barrel and cart beside a window.','4. In Pack-a-Punch, on the pipe beyond the left railing when facing away from the machine.','5. On the equipment immediately left of Speed Cola.','6. Behind the leaning debris beside the window opposite Stamin-Up.']}),
   step('ascension-phones','Listen for ringing at the red phones near the Spawn lander, beside PhD Flopper, and in the room below power beside a Box location. Interact while one is ringing to hear a Five character. Community claims about forcing calls conflict, so follow the audible ring rather than repeating a supposed guaranteed trigger.','Answer a ringing red phone for Five character audio.')
  ])
 ]},
 'bo1-call-of-the-dead':{sources:['https://callofduty.fandom.com/wiki/Call_of_the_Dead/Radios'],phases:[
  phase('recordings','Richtofen’s five diary radios',[
   step('cotd-story-radios','These are five story recordings, separate from the four co-op puzzle radios. Activate them in the following order and let each recording finish. No fuse, foghorn or dial input is needed to collect this lore.','Play the five diary radios in order.',{bullets:['1. Stamin-Up building: beneath the garage door to the right of the machine.','2. Lighthouse top: to the right of its Mystery Box spot.','3. Ship: in the shallow water below the MP40, beside the stairs.','4. Ship front: to the right of Double Tap.','5. Beyond the Speed Cola/Sickle tunnel: on the rock.']})
  ])
 ]},
 'bo1-shangri-la':{sources:['https://www.codzombieguides.com/shangri-la-remastered','https://callofduty.fandom.com/wiki/Shangri-La/Radios'],phases:[
  phase('monkey-secret','BO1 temple-monkey explosion',[
   step('shang-explode-monkeys','At Spawn, stand on the slightly raised stone shown in the photograph, facing the Pack-a-Punch stairs. On a controller, quickly press D-pad Up, Up, Down, then Jump (A on Xbox / Cross on PlayStation), leaving less than roughly 0.6 seconds between inputs. The monkeys on the temple explode. PC requires a connected controller for this input; it is a visual secret without a perk reward.','On the marked tile: Up, Up, Down, Jump on a controller.',{images:photos('shangri-la','explode_monkeys/tile_to_stand_on')})
  ]),
  phase('explorer-audio','Brock and Gary’s changing radio',[
   step('shang-radios','The explorer radio changes its message and position as the eclipse trials alter their fate. Start near the MPL/Minecart-side brick structure. Listen again around the nearby tunnel pressure plate as the trials advance, then check the crate by the Minecart and the base of the Pack-a-Punch pyramid during the later stages. These recordings explain the trial clues; a changed recording reflects quest progress rather than a second independent fetch quest.','Listen for the explorer radio as each crystal trial advances.')
  ])
 ]},
 'bo1-moon':{sources:['https://callofduty.fandom.com/wiki/Moon/Radios_and_Audio_Reels'],phases:[
  phase('recordings','Five radios and six audio reels',[
   step('moon-radios','Interact with the five radios below. Several require low-gravity jumps; equip the P.E.S. and check the landing before trying them.','Find the five story radios.',{bullets:['Outside Receiving Bay, beside a boulder on the cliff.','Outside the labs near Mule Kick, hanging from the crane.','Outside the first lab window on the right from power; breaking it removes air.','On the pipe opposite Tunnel 6’s second door.','On the support railing in the Biodome’s middle; reach it from a launch pad.']}),
   step('moon-reels','One reel appears at a time. Play it in the floor-2 lab machine left of the stairs from floor 1; another then spawns. Repeat for six recordings.','Find a reel, play it on lab floor 2, then search again.',{bullets:['MPD/power: opposite desk, left power conduits, or lab-airlock corner.','Tunnel 11: first-room desk; final-room box; by its window computers; computers opposite the power-room door.','Tunnel 6: beside its fourth window.','Receiving Bay: quest computer or rack behind the Box.','Labs: first Hacker desk.']})
  ])
 ]}
}
