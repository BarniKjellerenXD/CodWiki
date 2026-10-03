import {guide,phase,step,photos,collection,reddit,kennedy} from './chronicles-common.mjs'
const n='nacht-der-untoten',v='verruckt',s='shi-no-numa',k='kino-der-toten'
export const survivalGuides=[
 guide(n,'Nacht der Untoten','A compact survival map with a surprisingly easy-to-miss Samantha hunt. This Chronicles guide covers the room layout, equipment, all button and doll search locations, music and the final reward. There is no main story quest or ordinary Pack-a-Punch machine here.','free_max_ammo/button_mule',[
  phase('setup','Get equipped and learn the two floors',[
   step('setup-1','Open the Help door to the Mystery Box room, then choose a staircase to reach the upper floor. Keep a route between the rooms clear before starting a timed secret. This map has no power switch; you do not need to search for one.','Open Help and an upstairs route.'),
   step('setup-2','Use the Mystery Box for stronger weapons, including the Thundergun. Mule Kick is downstairs and Der Wunderfizz is upstairs. The upstairs cabinet sells a Locus for 5,000 points in BO3; buying it does not unlock a quest. There is no normal Pack-a-Punch route.','Locate the Box, Mule Kick and upstairs Wunderfizz.',{images:photos(n,'sniper_cabinet')})
  ],{group:'Key Features'}),
  phase('samantha','Samantha: four buttons, then five hidden dolls',[
   step('samantha-1','Interact with all four small wall buttons in any order. Check the pillar left of Mule Kick, beneath the shelf at the bottom of the Box-room stairs, the upper-room wall opposite the window across from Wunderfizz, and the ceiling above the spawn stairs. Listen for confirmation after pressing each.','Press all four hidden buttons.',{images:collection(n,'free_max_ammo/button_')}),
   step('samantha-2','Interact with the doll on the floor in front of the RK5 wall buy. Now find and shoot five dolls, one at a time, from the eight possible locations. Listen for music near the active doll and use a bullet weapon. A laugh after taking too long means you must restart from the RK5 doll.','Start at RK5; shoot five active dolls.',{images:photos(n,'free_max_ammo/sam_doll_rk5')}),
   step('samantha-reward','After the fifth target, return to the original doll. Interact with it again to finish the sequence, collect the Max Ammo and play Samantha’s Sorrow. The search photographs show possibilities, not a guaranteed spawn order.','Return to RK5 and claim the reward.')
  ],{group:'Side Quests',tools:['bo3-nacht-secrets']}),
  phase('extras','Undone and the radio',[
   step('extras-barrels','For Undone in Zombies Chronicles, shoot all 30 explosive barrels visible outside the building. Sweep the ground-floor windows and then the upstairs windows and broken walls. Destroying only the three commonly pictured BO1 barrels is not enough in BO3.','Destroy all 30 outside barrels for Undone.'),
   step('extras-1','Shoot or melee the radio on the table beside the Mystery Box to cycle its music. This is independent of the barrels and the Samantha hunt. Pause other music before starting a song if you want to hear it clearly.','Use the Box-room radio to cycle music.',{images:photos(n,'radio')}),
   step('extras-2','Use the photographed button and doll finder from the Samantha section to check unfamiliar sightlines. Select an image to enlarge it; the photographs do not reveal which random target is active in your match.','Use the photographs to identify each search location.')
  ])
 ]),
 guide(v,'Verrückt','The asylum starts co-op players on opposite sides and reconnects them at power. Learn that route first, then use photographs to solve the toilet code and search all ten Samantha locations. BO3 has no full main quest or ordinary Pack-a-Punch here.','free_max_ammo/fountain',[
  phase('setup','Reconnect the spawn sides and turn on power',[
   step('setup-1','Identify your spawn: Jugger-Nog is on one side, Quick Revive on the other. In co-op the team can begin separated. Follow your side’s doors upstairs rather than waiting for the dividing door to open.','Follow your spawn-side route upstairs.'),
   step('setup-2','Continue around the upper asylum to the power room and activate the switch. Power opens the central connection and enables perk machines and electric traps. Reunite before trying the timed doll hunt.','Turn on power and reunite the team.'),
   step('setup-3','Use the Mystery Box for weapons, including the Wunderwaffe DG-2 in Chronicles, and Wunderfizz for additional perks. Traps can clear a corridor but also hurt you; leave a safe way around. There is no normal Pack-a-Punch unlock.','Buy perks and establish a safe circuit.')
  ],{group:'Key Features'}),
  phase('secrets','Toilet codes and Samantha’s Sorrow',[
   step('secrets-2','For Lullaby of a Deadman, face the row of three toilets near the power/kitchen route and interact with the leftmost bowl three times. This short music trigger is separate from the Samantha code below.','Flush the left toilet three times for the song.',{images:photos(v,'song_ee/toilet')}),
   step('secrets-1','For Samantha, face those same three bowls: flush the rightmost 9 times, centre 3 times, leftmost 5 times. Count registered flushes and wait for the scream confirming the code. Then interact with the new doll on the floor to the left of Wunderfizz.','Enter right 9, centre 3, left 5; start at Wunderfizz.',{images:photos(v,'free_max_ammo/sam_doll')}),
   step('secrets-hunt','Shoot five dolls as they appear one at a time. Each can use any of the ten photographed spots below; nearby music helps identify the active one. If the timer expires and you hear a laugh, return to the starter doll beside Wunderfizz to restart.','Find five dolls using the location finder.'),
   step('secrets-reward','Return to the now-standing starter doll beside Wunderfizz and interact again. Collect the Max Ammo and listen to Samantha’s Sorrow.','Return to Wunderfizz and collect the reward.')
  ],{group:'Side Quests',tools:['bo3-verruckt-dolls']})
 ],[
  phase('atmosphere','Dentist chair and courtyard fountain',[
   step('atmosphere-chair','Interact near the dentist chair in the Jugger-Nog spawn room to hear its unsettling audio. This is a small environmental secret and does not award equipment.','Interact at the Jugger-Nog dentist chair.',{images:photos(v,'free_max_ammo/dentist')}),
   step('atmosphere-fountain','Look into the central courtyard and shoot the statue at the fountain to see its blood effect. The fountain is also one possible Samantha target location; the effects are separate.','Inspect the courtyard fountain.',{images:photos(v,'free_max_ammo/fountain')})
  ])
 ],[reddit(v),kennedy(v),'https://callofduty.fandom.com/wiki/Samantha%27s_Sorrow']),
 guide(s,'Shi No Numa','Four huts surround the main building, with random perk locations and a short photographed Samantha secret. This is the BO3 remaster: the Vanguard main quest does not apply, and there is no normal Pack-a-Punch quest.','free_max_ammo/doll_bridge',[
  phase('setup','Open the huts and find your perks',[
   step('setup-1','Leave the upstairs spawn through either purchasable route into the main building. Open paths to Doctor’s Quarters, Fishing Hut, Storage and the Comm Room. Slow swamp water can trap you; learn the boardwalks before moving a horde.','Open the main building and hut paths.'),
   step('setup-2','Open each hut to reveal its random perk machine. Jugger-Nog, Speed Cola, Double Tap and Quick Revive move between the four huts each match. There is no central power switch to activate. The notebook is optional if your team keeps forgetting which hut has which perk.','Discover the four random hut perks.'),
   step('setup-3','The Mystery Box can provide the Wunderwaffe DG-2; the Flogger outside the main building and hut traps give additional crowd control. Keep a starting pistol if you want the pan secret below. There is no ordinary Pack-a-Punch machine.','Keep your starting pistol for the pan secret.')
  ],{group:'Key Features',tools:['bo3-shi-perks']}),
  phase('secrets','The One and the Fishing Hut doll hunt',[
   step('secrets-2','At the Comm Room, interact with the black telephone three times. You will hear the call and The One will play. This does not start the Samantha hunt.','Use the Comm Room telephone three times.',{images:photos(s,'song_ee/phone')}),
   step('secrets-1','Inside Fishing Hut, quickly shoot the four hanging pans that have a silver band using your starting pistol. Use the four photographs to distinguish them from the other pans. A sound confirms all four have registered.','Shoot the four silver-banded pans with your starting pistol.',{images:collection(s,'free_max_ammo/plate_')}),
   step('secrets-dolls','Interact with the doll on the ground beside the rubbish near Fishing Hut. Turn toward the bridge outside the hut and shoot each doll as it appears on the bridge supports. The targets appear in succession; keep watching until the sequence finishes.','Start at the Fishing Hut doll and shoot the bridge targets.',{images:collection(s,'free_max_ammo/doll')}),
   step('secrets-finish','Return to the original doll and interact to receive a Max Ammo and play Samantha’s Sorrow. If the hunt stops before completion, use that same starter doll to try again.','Return to the starter doll for the reward.')
  ],{group:'Side Quests'})
 ]),
 guide(k,'Kino der Toten','Turn on the stage lights, link the teleporter and explore the theatre’s music, film reels and Samantha secret. There is no long main story quest on Kino. The knock helper and ten-location photograph finder are here for the parts you must remember or search.','power/power',[
  phase('setup','Power and Pack-a-Punch',[
   step('setup-1','Open a route from the lobby to the stage through either side of the theatre. Flip the power switch on the stage to open the curtain and connect the stage to the seating area and lobby.','Reach the stage and switch on power.',{images:photos(k,'power/power')}),
   step('setup-link','Interact with the teleporter on the stage to begin linking, then run to the circular pad in the lobby and interact there to finish the link. Both parts are required before the stage teleporter will take you to Pack-a-Punch.','Link the stage teleporter to the lobby pad.',{images:photos(k,'pap/mainframe','pap/teleporter_pad')}),
   step('setup-2','Return to the stage teleporter and activate it. In the projector room, spend 5,000 points at Pack-a-Punch and collect your gun before the roughly 30-second visit ends. After returning and the cooldown finishing, link the two pads again for another trip.','Teleport, upgrade and retrieve your weapon before returning.'),
   step('setup-3','Teleporter returns can briefly send you through small side rooms. Search those rooms for a film reel and pick it up before the return completes. On your next Pack-a-Punch trip, interact with the projector to play the reel. Repeat trips to find the other reels; the room order is random.','Collect intermission-room film reels and play them upstairs.',{images:photos(k,'film_reels/projector')})
  ],{group:'Key Features'}),
  phase('secrets','115, film reels and Samantha knocks',[
   step('secrets-1','Interact with three red meteor fragments to play 115: the jar under the lobby stairs by Quick Revive, the stand near the dressing-room mannequins behind the KN-44 wall buy, and the shelf with letters in the upstairs room on the Alley side.','Find all three 115 meteor fragments.',{images:collection(k,'song_ee/rock_')}),
   step('secrets-2','At the blue door in the Alley, listen to the three groups of knocks. Melee the door with the same number of hits per group, leaving a short pause between groups. After it accepts the answer, listen again: you must answer three different patterns in total.','Repeat three knock patterns, listening anew each time.',{images:photos(k,'free_max_ammo/blue_door')}),
   step('secrets-3','After the third accepted knock pattern, start the doll at the stage. Complete the five-target hunt described in the Samantha section below, then return to its starter for the Max Ammo and song.','Complete the stage doll hunt and collect its reward.')
  ],{group:'Side Quests',tools:['bo3-kino-knocks']})
 ],[
  phase('samantha','Find the five active dolls',[
   step('kino-doll-start','After all three knock responses are accepted, interact with the doll at the front-right of the stage. Shoot five targets, one at a time, from the ten possible locations. Use the photographs below and follow the sound near the active target.','Start the stage doll hunt.',{images:photos(k,'free_max_ammo/doll_init_loc')}),
   step('kino-doll-finish','If a laugh interrupts the hunt, return to the stage starter doll and try again. Once all five are shot, interact with the original doll to collect a Max Ammo and play Samantha’s Sorrow.','Finish five targets and return for the reward.')
  ],{tools:['bo3-kino-dolls']}),
  phase('rocket','Launch the model rocket',[
   step('kino-rocket','With power on, stand beside the left of the two dressing-room mannequins near the door toward Speed Cola and jump five times. During later teleporter trips, if you land in the Pentagon side room, interact with the small rocket model to launch it. Getting that room is random.','Jump by the dressing-room mannequin; activate the Pentagon model.',{images:photos(k,'rocket_launch/mannequins','rocket_launch/rocket')})
  ])
 ])
]
