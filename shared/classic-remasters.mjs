// BO1-authored routes; shared-layout photographs are credited in each guide.
export const classicRemasterGuides = [
  {
    "id": "bo1-ascension",
    "gameId": "bo1",
    "name": "Ascension",
    "intro": "Power, all three lunar landers, the four-player Casimir Mechanism and the original side secrets. Solo players can unlock Pack-a-Punch, earn monkey-round perks and play the music, but the unmodified main quest needs four players.",
    "questLabel": "Main Easter Egg",
    "image": "/images/chronicles/ascension/power/power_switch.webp",
    "phases": [
      {
        "id": "setup",
        "title": "Power, landers and Pack-a-Punch",
        "steps": [
          {
            "id": "setup-1",
            "text": "Climb from Spawn to the upper power platform and flip the switch to restore colour. Locate the three outer landers at PhD Flopper, Stamin-Up and Speed Cola. Jugger-Nog is on the lower route beside the stairs from Spawn; buy it before risking long lander calls.",
            "quick": "Turn on power and find the three landers.",
            "images": [
              {
                "src": "/images/chronicles/ascension/power/power_switch.webp",
                "alt": "Power Switch"
              },
              {
                "src": "/images/chronicles/ascension/pap/station_phd.webp",
                "alt": "PhD Flopper - On the right when coming from spawn, on the way to Power"
              },
              {
                "src": "/images/chronicles/ascension/pap/station_staminup.webp",
                "alt": "Stamin Up - On the left when coming from spawn, at the back of that path"
              },
              {
                "src": "/images/chronicles/ascension/pap/station_speed_cola.webp",
                "alt": "Speed Cola - In the buildings past the power switch, toward the rocket"
              }
            ]
          },
          {
            "id": "setup-2",
            "text": "At each of the three outer stations, call the lander and ride it back to spawn. Once the launch panel shows all routes complete, press the launch button beside power. Wait for the rocket to leave, enter its launch area and use Pack-a-Punch in the side room below the pad.",
            "quick": "Ride all three landers to spawn, launch the rocket, enter Pack-a-Punch.",
            "images": [
              {
                "src": "/images/chronicles/ascension/pap/lander_control_panel.webp",
                "alt": "control panel"
              },
              {
                "src": "/images/chronicles/ascension/pap/rocket_launch_button.webp",
                "alt": "button beside the power switch"
              },
              {
                "src": "/images/chronicles/ascension/pap/pap_room.webp",
                "alt": "side room, below where the rocket was"
              }
            ]
          }
        ],
        "tools": [],
        "group": "Key Features"
      },
      {
        "id": "nodes",
        "title": "Casimir Mechanism: activate the first three nodes",
        "steps": [
          {
            "id": "nodes-1",
            "text": "Prepare four players, Gersh Devices, Matryoshka Dolls, a Thundergun and a Ray Gun. Upgrade the damage weapons before the finale. Throw a Gersh beside the sparking generator beyond the PhD Flopper lander, outside the playable fence near the MP5K, so it is pulled away. Activate the small television under the stairs in the flooded Stamin-Up area; its screen lights up.",
            "quick": "Gersh the generator, then activate the Stamin-Up television.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/gersh_generator.webp",
                "alt": "sparking generator"
              },
              {
                "src": "/images/chronicles/ascension/main_ee/tv.webp",
                "alt": "TV"
              }
            ]
          },
          {
            "id": "nodes-2",
            "text": "During a Space Monkey round, station one player at each button beside Jugger-Nog, PhD Flopper, Speed Cola and Stamin-Up. On a shared countdown, press all four together. Listen for the completion cue before leaving. These buttons are a quest step, separate from defending perk machines.",
            "quick": "Press the four perk-area buttons together during monkeys.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/jug_button.webp",
                "alt": "Juggernog - In front of the machine"
              },
              {
                "src": "/images/chronicles/ascension/main_ee/phd_button.webp",
                "alt": "PhD Flopper - Left of the machine"
              },
              {
                "src": "/images/chronicles/ascension/main_ee/speed_cola_button.webp",
                "alt": "Speed Cola - On the otherside of the doorway, to the right of the machine"
              },
              {
                "src": "/images/chronicles/ascension/main_ee/staminup_button.webp",
                "alt": "Stamin-Up - On the wall just to the left of the machine"
              }
            ]
          },
          {
            "id": "nodes-3",
            "text": "All four players stand within the circular pressure plate under the rocket. Remain inside for about two minutes while the wall clock completes a full turn. You may shoot and move within the circle; stepping off interrupts the attempt. The reward/cue confirms the node is finished.",
            "quick": "Keep all four players on the rocket-pad plate until the clock finishes.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/pressure_plate.webp",
                "alt": "pressure plate (circular area)"
              },
              {
                "src": "/images/chronicles/ascension/main_ee/clock.webp",
                "alt": "clock on the wall"
              }
            ]
          }
        ],
        "tools": [],
        "group": "Main Quest"
      },
      {
        "id": "luna",
        "title": "Spell LUNA with the lander",
        "steps": [
          {
            "id": "luna-1",
            "text": "Choose one rider; teammates call the lander from the destination controls. Collect the floating letters with these four journeys in order: Spawn → Stamin-Up (L), Stamin-Up → Spawn (U), Spawn → Speed Cola (N), Speed Cola → Stamin-Up (A). The rider stays aboard for each letter.",
            "quick": "Ride Spawn → Stamin → Spawn → Speed → Stamin.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/letter_in_sky.webp",
                "alt": "letters"
              }
            ],
            "bullets": [
              "L: a teammate at Stamin-Up calls the rider from Spawn.",
              "U: a teammate at Spawn calls the rider back.",
              "N: a teammate at Speed Cola calls the rider from Spawn.",
              "A: a teammate at Stamin-Up calls the rider from Speed Cola."
            ]
          },
          {
            "id": "luna-2",
            "text": "Check the crashed rocket module near Stamin-Up after the letters. All four indicators should now be lit. If one is missing, review the corresponding node before spending your finale ammunition.",
            "quick": "Confirm all four module indicators.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/rocket_module.webp",
                "alt": "crashed rocket module"
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "orb",
        "title": "Free Gersh",
        "steps": [
          {
            "id": "orb-1",
            "text": "Find the white light on the ground near the crashed rocket module. Throw a Gersh Device onto it, then have the team fire the upgraded Thundergun and upgraded Ray Gun into the trapped light while detonating Matryoshka Dolls there. Coordinate the damage inside the same Gersh window.",
            "quick": "Gersh the white light and concentrate upgraded weapons plus Matryoshkas.",
            "images": [
              {
                "src": "/images/chronicles/ascension/main_ee/white_orb.webp",
                "alt": "white orb on the ground"
              }
            ]
          },
          {
            "id": "orb-2",
            "text": "If Gersh asks for more power, repeat the concentrated damage with fresh equipment. His light rising into the sky and final dialogue confirm completion. Each player receives a Death Machine for about 90 seconds. The BO1 quest does not award permanent perks; the match continues.",
            "quick": "Repeat if needed until Gersh is freed."
          }
        ],
        "tools": []
      }
    ],
    "sidePhases": [
      {
        "id": "monkeys",
        "title": "Space Monkeys and the launch bonus",
        "steps": [
          {
            "id": "monkeys-perks",
            "text": "After perks have been purchased, Space Monkey rounds can attack those machines. Defend them before the monkeys reach them. Finishing a monkey round without any machine being touched earns a random perk bottle along with the Max Ammo; merely preventing a perk loss is not enough.",
            "quick": "Defend every owned perk machine without a touch."
          },
          {
            "id": "rocket-bonus",
            "text": "When launching the rocket for Pack-a-Punch, destroy it with sufficient weapon damage while it rises to reveal a Double Points pickup at the launch area. This is an optional launch bonus, not a required quest node.",
            "quick": "Destroy the launching rocket for Double Points."
          }
        ],
        "tools": [],
        "group": "Side Quests"
      },
      {
        "id": "music",
        "title": "Abracadavre and the character dolls",
        "steps": [
          {
            "id": "ascension-song",
            "text": "Interact with three teddy bears: on the upper floor of Spawn beside the Olympia, against the wall near the Sickle/Speed Cola lander approach, and behind the fence to the left of the Stamin-Up lander. Listen for a cue from each; the third starts Abracadavre.",
            "quick": "Activate the three Abracadavre bears.",
            "images": [
              {
                "src": "/images/chronicles/ascension/song_ee/bear_spawn.webp",
                "alt": "Spawn Room - On the upper level, left of the Olympia wallbuy"
              },
              {
                "src": "/images/chronicles/ascension/song_ee/bear_speed_cola.webp",
                "alt": "Speed Cola Lander Station - On top of the wall, left of the hallway between the station and Speed Cola"
              },
              {
                "src": "/images/chronicles/ascension/song_ee/bear_staminup.webp",
                "alt": "Stamin-up Lander Station - Behind the fence, left of the lander when facing the station"
              }
            ]
          },
          {
            "id": "ascension-characters",
            "text": "Interact with four small character dolls for dialogue: Takeo beside PhD Flopper, Richtofen on the desk on the floor above Jugger-Nog, Nikolai beside Speed Cola, and Dempsey by the Claymore wall buy near Stamin-Up. Each is a separate voice interaction.",
            "quick": "Listen to the four character dolls.",
            "images": [
              {
                "src": "/images/chronicles/ascension/ultimis_dolls/takeo.webp",
                "alt": "Takeo - Next to the PhD Flopper perk machine"
              },
              {
                "src": "/images/chronicles/ascension/ultimis_dolls/richtofen.webp",
                "alt": "Richtofen - On a desk on the floor above Juggernog"
              },
              {
                "src": "/images/chronicles/ascension/ultimis_dolls/nikolai.webp",
                "alt": "Nikolai - On the machine left of Speed Cola"
              },
              {
                "src": "/images/chronicles/ascension/ultimis_dolls/dempsey.webp",
                "alt": "Dempsey - Next to the Claymore wallbuy in the Stamin Up lander station area"
              }
            ]
          }
        ],
        "tools": []
      }
    ],
    "sources": [
      "https://www.reddit.com/r/CODZombies/wiki/ascension/",
      "https://mmmrkennedy.com/games/BO1/ascension/ascension_guide",
      "https://www.codzombiesguides.com/main-quests/black-ops-1/ascension/"
    ],
    "reviewed": "2026-10-03",
    "reviewNote": "Written for Black Ops (2010), with its title updates; mobile editions and modded maps can differ. Community guides and illustrated references were cross-checked on 3 October 2026. Gameplay: Activision / Treyarch; photographs: the credited community authors below. Reused photographs may show a remaster of the same location; the instructions describe this edition. Source review and software checks are not an in-game playthrough."
  },
  {
    "id": "bo1-shangri-la",
    "gameId": "bo1",
    "name": "Shangri-La",
    "intro": "The original four-player Time Travel Will Tell quest, from the first eclipse to the Focusing Stone. Photographed symbols, tile locations and gong notes support the steps that need communication. Power, Pack-a-Punch, the song and monkey rewards are also available outside the main quest.",
    "questLabel": "Main Easter Egg",
    "image": "/images/chronicles/shangri-la/power/power.webp",
    "phases": [
      {
        "id": "setup",
        "title": "Power, Pack-a-Punch and the eclipse",
        "steps": [
          {
            "id": "setup-1",
            "text": "Reach the underground power room and activate both switches. For Pack-a-Punch, find the raised pressure plates in front of the four-section statues: Spawn, bottom of Rope Bridge, between the power switches and the Minecart tunnel. One plate is required per player; everyone stands on their raised plate simultaneously to stop the rotating statue sections and raise the spawn stairs. Upgrade promptly before the stairs close.",
            "quick": "Activate both power switches; stand on the raised Pack-a-Punch plates.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/power/power.webp",
                "alt": "mine room"
              },
              {
                "src": "/images/chronicles/shangri-la/pap/statue_spawn.webp",
                "alt": "Spawn Room - In front of the Quick Revive machine"
              },
              {
                "src": "/images/chronicles/shangri-la/pap/statue_rope_bridge.webp",
                "alt": "Rope Bridge Area - At the bottom of the Rope Bridge"
              },
              {
                "src": "/images/chronicles/shangri-la/pap/statue_power.webp",
                "alt": "Power Room - Between the two power switches"
              },
              {
                "src": "/images/chronicles/shangri-la/pap/statue_tunnel.webp",
                "alt": "Minecart Area Tunnel - Halfway through the tunnel leading to the underground area"
              },
              {
                "src": "/images/chronicles/shangri-la/pap/pap_stairs.webp",
                "alt": "stairs in front of Quick Revive"
              }
            ]
          },
          {
            "id": "setup-2",
            "text": "The main quest needs four players. Press the four small buttons around Quick Revive together to enter an eclipse. Start a fresh eclipse for each crystal trial below. A successful trial returns daylight; a failed or expired attempt can be retried with the buttons. Obtain the 31-79 JGb215 (“Baby Gun”) from the Box and keep it for the shrinking steps.",
            "quick": "Use four players to trigger an eclipse before each trial.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/buttons_to_enter_eclipse.webp",
                "alt": "buttons in each of the corners around Quick Revive"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/horizontal_pillar.webp",
                "alt": "horizontal pillar"
              }
            ]
          }
        ],
        "tools": [],
        "group": "Key Features"
      },
      {
        "id": "tiles",
        "title": "Crystal 1: match the twelve tile pairs",
        "steps": [
          {
            "id": "tiles-1",
            "text": "During the eclipse, press the button on the brick structure by the MPL/Minecart side. Twelve floor tiles appear here and twelve near Rope Bridge. Each tile reveals its symbol when stood on; every symbol has one matching partner on the other side. Assign a player to each side and keep the other two off the tiles.",
            "quick": "Activate the brick button and assign one caller per tile area.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/button_mpl.webp",
                "alt": "button on the brick structure"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tiles_minecart.webp",
                "alt": "mine cart area"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tiles_rope_bridge.webp",
                "alt": "around the rope bridge"
              }
            ]
          },
          {
            "id": "tiles-2",
            "text": "Explore one side at a time while the other player stands clear. Agree on a landmark name for each tile and record the revealed symbol with the helper. Once a pair is found, stand on both matching tiles together to remove them. A mismatched pair resets the tiles. Repeat until all twelve pairs disappear and daylight returns.",
            "quick": "Discover and stand on all twelve matching pairs.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/shangri_la_symbols.webp",
                "alt": "cheat sheet"
              }
            ]
          }
        ],
        "tools": [
          "bo1-shang-tiles"
        ],
        "group": "Main Quest"
      },
      {
        "id": "trials",
        "title": "Crystals 2–4: slide, shrinking ball and gas",
        "steps": [
          {
            "id": "trials-1",
            "text": "Enter an eclipse. Put three players on the metal grate at the bottom of the water slide. The fourth slides down and holds interact at the lever on the right-hand wall on the way past. Keep the three players on the grate until the success cue returns daylight.",
            "quick": "Three wait on the grate; the fourth uses the slide lever.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/slide_grate.webp",
                "alt": "metal grate at the bottom of the water slide"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/water_slide_lever.webp",
                "alt": "lever on the right side"
              }
            ]
          },
          {
            "id": "trials-2",
            "text": "Enter an eclipse. Use an explosive to knock down the crystal above the water slide, shoot it with the Baby Gun to shrink it, and melee it down the slide. Follow it to the geyser at the bottom and stand there to launch it into place.",
            "quick": "Explode, shrink and knife the slide crystal into the geyser.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/ball_above_slide.webp",
                "alt": "crystal ball above the water slide"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/ball_in_geyser.webp",
                "alt": "geyser at the bottom of the slide"
              }
            ]
          },
          {
            "id": "trials-3",
            "text": "Enter an eclipse and turn the Minecart-side tunnel valve four times. Escort a live Napalm Zombie through the three leaking gas pipes: beside the valve, above the Box location near AK74u, and above the M16 underground. Stay far enough away that it does not detonate prematurely. Once all three leaks burn, pull the lever beside the valve.",
            "quick": "Turn the valve four times; ignite all three leaks with a Napalm Zombie.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/valve.webp",
                "alt": "valve in the tunnel"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/gas_pipe_valve.webp",
                "alt": "Minecart Side Tunnel - Right of the valve"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/gas_pipe_mystery_box.webp",
                "alt": "Minecart Side Tunnel - Above the Mystery Box locations, in the room with the AK-74u/Kuda wallbuy"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/gas_pipe_m16.webp",
                "alt": "Minecart Side Underground - Above the M16 wallbuy"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/gas_lever.webp",
                "alt": "lever beside the valve"
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "holes",
        "title": "Crystal 5: plug the four tunnel holes",
        "steps": [
          {
            "id": "holes-mines",
            "text": "Buy Spikemores from the power-room wall buy. During an eclipse, place one facing each of the four holes along the left wall of the tunnel descending toward the Waterfall. Lure zombies into detonating them so the spikes plug the holes. Check each hole is visibly filled; replenish Spikemores if a placement misses.",
            "quick": "Plug all four tunnel holes with detonated Spikemores.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/spikemore.webp",
                "alt": "Spikemores from the wallbuy"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/hole.webp",
                "alt": "holes in the wall"
              }
            ]
          },
          {
            "id": "holes-brick",
            "text": "When all four holes are plugged, press the protruding brick in the wall at the pool below the Waterfall. Daylight and the next crystal confirm completion.",
            "quick": "Press the pool-wall brick.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/brick_to_push.webp",
                "alt": "brick on the wall in the pool"
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "dials",
        "title": "Crystal 6: wall tiles, teepee and mud-room dials",
        "steps": [
          {
            "id": "dials-tiles",
            "text": "In an eclipse, melee all twelve symbol tiles on walls until they glow. Sweep the Minecart start and spikes, both sides behind Quick Revive, the Pack-a-Punch stairs, Mud Room, Waterfall stairway and power room. The photographs show every tile; these are different from the floor tiles used for matching.",
            "quick": "Melee the twelve wall tiles.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_minecart_start.webp",
                "alt": "Minecart Area - Left of the start of the Minecart"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_below_dynamite.webp",
                "alt": "Minecart Area - Around the corner from the previous location toward Spawn"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_minecart_spikes.webp",
                "alt": "Minecart Area - On the wall by the spikes, between Spawn and the Minecart"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_quick_machine_left.webp",
                "alt": "Spawn Room - Left of the Quick Revive machine, on the other side of the wall"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_quick_machine_right.webp",
                "alt": "Spawn Room - Right of the Quick Revive machine, on the other side of the wall"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_spikes_mud.webp",
                "alt": "Spawn Room - On the wall by the spikes, between Spawn and the Mud Room"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_pap_stairs.webp",
                "alt": "Spawn Room - Left of the stairs to the Pack-a-Punch Machine"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_mud_water_slide.webp",
                "alt": "Mud Room Area - Left of the dial closest to the Water Slide"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_pm63.webp",
                "alt": "Mud Room Area - Left of the PM63/L-CAR 9 wallbuy"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_stakeout.webp",
                "alt": "Waterfall Area - Left of the Stakeout/ICR-1 wallbuy"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_stakeout_2.webp",
                "alt": "Waterfall Area - At the bottom of the stairs up to the Power room"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/tile_power.webp",
                "alt": "Power Room - Left of the left power switch"
              }
            ]
          },
          {
            "id": "dials-teepee",
            "text": "Shoot the distant teepee visible from the Minecart area with an explosive. Its destruction ends this eclipse. Start a fresh eclipse for the dials.",
            "quick": "Explode the distant teepee, then enter another eclipse.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/teepee.webp",
                "alt": "teepee"
              }
            ]
          },
          {
            "id": "dials-code",
            "text": "Enter the Mud Room from Spawn. Start with the dial immediately on your left and work clockwise. Set the top faces to 4, 3, 16, 1. Read dots as one, a line as five and the bracket shape as ten; the chart shows the exact faces. Wait for confirmation before continuing.",
            "quick": "Set the mud-room dials clockwise to 4, 3, 16, 1.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/first_dial.webp",
                "alt": "dial on the left when coming from spawn"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/shang_dials_cheat_sheet.webp",
                "alt": "cheat sheet"
              }
            ]
          }
        ],
        "tools": [
          "bo1-shang-locations"
        ]
      },
      {
        "id": "stone",
        "title": "Charge the crystals and claim the Focusing Stone",
        "steps": [
          {
            "id": "stone-1",
            "text": "Pack-a-Punch the Baby Gun into the Fractalizer. During an eclipse, test the eight gongs to identify the four correct ones. A wrong gong flashes the crystals red and cancels the current ringing; it does not change which four are correct. Record the results below, then ring only the four correct gongs so all are sounding together and the crystals glow yellow.",
            "quick": "Find and ring the four correct gongs during the eclipse."
          },
          {
            "id": "stone-dynamite",
            "text": "With the crystals charged, shoot the crystal above the Minecart geyser using the Fractalizer. Stand directly under the falling dynamite to catch it; no interact press is needed. If you miss it, recharge the correct gongs and try again.",
            "quick": "Shoot the geyser crystal and catch the dynamite.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/crystal_with_dynamite.webp",
                "alt": "Crystal above the Geyser"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/dynamite.webp",
                "alt": "dynamite"
              }
            ]
          },
          {
            "id": "stone-meteor",
            "text": "Recharge the four correct gongs if necessary, then shoot the crystal above the Mud Room with the Fractalizer. Its beam travels around the crystals and shrinks the meteor above Pack-a-Punch. The unupgraded Baby Gun cannot complete this step.",
            "quick": "Shoot the charged Mud Room crystal to shrink the meteor.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/crystal_to_shoot.webp",
                "alt": "Crystal above the Mud room"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/big_meteor.webp",
                "alt": "giant meteor above the PAP machine"
              }
            ]
          },
          {
            "id": "stone-2",
            "text": "Raise the Pack-a-Punch stairs with the team. Interact at the holed brick wall, let Brock finish speaking, and give him the dynamite through the opening. Everyone leaves the upper area so the eclipse ends. Raise the stairs again in daylight and take the Focusing Stone from the altar. Only the player collecting it gets permanent perks; repeat the quest for additional players.",
            "quick": "Give Brock the dynamite; return in daylight for the Focusing Stone.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/main_ee/wall_with_hole.webp",
                "alt": "brick wall with some holes"
              },
              {
                "src": "/images/chronicles/shangri-la/main_ee/stone_on_altar.webp",
                "alt": "Focusing Stone will be atop an altar"
              }
            ]
          }
        ],
        "tools": [
          "bo1-shang-gongs"
        ]
      }
    ],
    "sidePhases": [
      {
        "id": "music-perks",
        "title": "Pareidolia and monkey power-up cycling",
        "steps": [
          {
            "id": "shang-song",
            "text": "Interact with three red meteor fragments: beside the barrels in Spawn, underground beside the minecart tracks and barbed wire, and at the top of Rope Bridge on the left when facing the Waterfall. Stand close enough for each activation sound. The third starts Pareidolia.",
            "quick": "Activate the three Pareidolia meteors.",
            "images": [
              {
                "src": "/images/chronicles/shangri-la/song_ee/meteor_spawn.webp",
                "alt": "Spawn Room - Right of the Spikes to the Minecart area"
              },
              {
                "src": "/images/chronicles/shangri-la/song_ee/meteor_underground.webp",
                "alt": "Minecart Side Underground - In the room with the minecart tracks, by the Barbed Wire, left of the Zombie spawn window"
              },
              {
                "src": "/images/chronicles/shangri-la/song_ee/meteor_rope_bridge.webp",
                "alt": "Rope Bridge Area - At the top of the Rope Bridge, on the left when facing the Waterfall"
              }
            ]
          },
          {
            "id": "shang-monkey-perk",
            "text": "Let a monkey pick up an uncollected power-up and watch the icon change as it runs. Kill it while the desired icon is displayed to drop that reward. A stolen Max Ammo can cycle through a very brief perk-bottle icon, allowing a free perk. Plan the shot before it reaches the temple and escapes.",
            "quick": "Shoot a power-up-carrying monkey at the desired icon."
          }
        ],
        "tools": []
      }
    ],
    "sources": [
      "https://www.reddit.com/r/CODZombies/wiki/shangri-la/",
      "https://mmmrkennedy.com/games/BO1/shangri_la/shangri_la_guide",
      "https://www.codzombiesguides.com/main-quests/black-ops-1/shangri-la/"
    ],
    "reviewed": "2026-10-03",
    "reviewNote": "Written for Black Ops (2010), with its title updates; mobile editions and modded maps can differ. Community guides and illustrated references were cross-checked on 3 October 2026. Gameplay: Activision / Treyarch; photographs: the credited community authors below. Reused photographs may show a remaster of the same location; the instructions describe this edition. Source review and software checks are not an in-game playthrough."
  },
  {
    "id": "bo1-moon",
    "gameId": "bo1",
    "name": "Moon",
    "intro": "The BO1 route through Cryogenic Slumber Party and Big Bang Theory. The first half works solo. The full ending needs 2–4 players, Richtofen and the saved Call of the Dead co-op and Shangri-La quest prerequisites. Check the Vril Device before investing in the full run.",
    "questLabel": "Main Easter Egg",
    "image": "/images/chronicles/moon/moon.webp",
    "phases": [
      {
        "id": "requirements",
        "title": "Choose the solo milestone or the full co-op ending",
        "steps": [
          {
            "id": "moon-requirements",
            "text": "For Cryogenic Slumber Party, one player can complete the computers, Hacker panels, Tunnel 6 sphere and first soul tube. For Big Bang Theory, use 2–4 players with Richtofen in the match. Arrange for a participating player to have completed both Call of the Dead’s co-op Ensemble Cast and Shangri-La’s Time Travel Will Tell on the same saved profile. Check Richtofen’s HUD for the combined Vril Device at the start; without it, stop at the first milestone.",
            "quick": "Check team size, Richtofen and the combined Vril Device.",
            "note": "BO1’s solo character is Dempsey. The full solo ending described in Chronicles guides belongs to BO3, not unmodified BO1."
          }
        ],
        "tools": [],
        "group": "Key Features"
      },
      {
        "id": "setup",
        "title": "Survive Area 51 and equip your P.E.S.",
        "steps": [
          {
            "id": "setup-1",
            "text": "At Area 51, the alarm opens the teleporter cage. Move all players onto the pad to escape. On arrival at Griffin Station, immediately take a P.E.S. from the locker and equip it before going outside. Open either Tunnel 6 or Tunnel 11 to reach the pyramid room and flip the power switch.",
            "quick": "Escape Area 51, equip P.E.S., reach the MPD power switch.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-power-switch-next-to-mpd.webp",
                "alt": "Power Switch Next to M.P.D."
              }
            ]
          },
          {
            "id": "setup-2",
            "text": "Open the laboratories and outside teleporter route. All players stand on the Moon teleporter when its lights are green to revisit Area 51 for Pack-a-Punch. Jugger-Nog and Speed Cola alternate there between visits. Obtain the Wave Gun, Gersh Devices and Q.E.D.s from the Box for the quest; Gersh and Q.E.D. occupy the same slot, so plan to obtain Gersh again for the ending.",
            "quick": "Open the return teleporter and gather Wave Gun, Gersh and Q.E.D."
          }
        ],
        "tools": []
      },
      {
        "id": "hacker",
        "title": "Find the Hacker and protect your air",
        "steps": [
          {
            "id": "hacker-find",
            "text": "The Hacker is a small brown device on a yellow pad in the three-floor laboratory. Search two spots per floor. Picking it up replaces your P.E.S.; swapping back to P.E.S. drops the Hacker. Use pressurised routes and return for a suit before a long trip through a breached area.",
            "quick": "Search the six laboratory Hacker spots.",
            "images": [
              {
                "src": "/images/chronicles/moon/hacker-reference.png",
                "alt": "Hacker reference"
              }
            ],
            "bullets": [
              "Floor 1: shelf near the stairs; shelf near the doorway from the MPD room.",
              "Floor 2: electrical box beside the stairs; blue structural railing on the opposite side.",
              "Floor 3: metal tanks beside Deadshot; shelf left of the Biodome doorway."
            ]
          },
          {
            "id": "hacker-excavators",
            "text": "Listen to the excavator announcement: Pi breaches Tunnel 6, Omicron Tunnel 11, Epsilon the Biodome. Hack the matching active console in the Receiving Bay to stop/retract it. For the main quest, Pi must actually breach Tunnel 6 once before you retract it. Retraction clears the machinery but does not restore the lost atmosphere.",
            "quick": "Allow the required Pi breach; stop other excavators when possible.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-excavator-pi-breaching-tunnel-6.webp",
                "alt": "Excavator Pi breaching Tunnel 6"
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "simon",
        "title": "Samantha Says and the timed laboratory panels",
        "steps": [
          {
            "id": "simon-1",
            "text": "After power is on, interact with the four computers outside the Receiving Bay near Tunnel 6. Facing them, the physical order from left to right is Red, Green, Blue, Yellow. Watch the flashing sequence, then interact with the matching computers in that order. Complete the initial set of increasingly long sequences. Red failure feedback means replay the attempt.",
            "quick": "Repeat the first Samantha Says sequences.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-simon-says-computers.webp",
                "alt": "Simon Says Computers"
              }
            ]
          },
          {
            "id": "simon-2",
            "text": "Take the Hacker to floor 2 of the laboratories. Hack the far-left button on the four-button wall for 500 points. A roughly 60-second timer starts: locate and hack the four green-lit panel boxes among the eight possible boxes across the three floors. Ordinary unlit boxes do not count.",
            "quick": "Hack the starting button, then the four green panel boxes.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-button-wall.webp",
                "alt": "Button Wall"
              }
            ]
          },
          {
            "id": "simon-3",
            "text": "Return to the four-button wall and quickly interact with all four buttons normally, rather than hacking them. The illuminated wall confirms success. If the timed attempt failed, restart at the initial button and search again; the selected green boxes may differ.",
            "quick": "Press all four wall buttons and confirm they light.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-glowing-button-wall.webp",
                "alt": "Buttons glowing on button wall"
              }
            ]
          }
        ],
        "tools": [
          "bo1-moon-simon",
          "bo1-moon-labs"
        ],
        "group": "Main Quest"
      },
      {
        "id": "sphere",
        "title": "Tunnel 6, the sphere and the first soul tube",
        "steps": [
          {
            "id": "sphere-1",
            "text": "Wait for Excavator Pi to breach Tunnel 6, then retract it with the Hacker at the Receiving Bay. Equip a P.E.S. for the now-depressurised tunnel. Find the black Vril Sphere on the Tunnel 6 floor and melee it to start it moving toward spawn.",
            "quick": "After Pi breaches, retract it and move the Tunnel 6 sphere.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-vril-sphere.webp",
                "alt": "Vril Sphere"
              }
            ]
          },
          {
            "id": "sphere-2",
            "text": "Follow the sphere. When it lodges on the satellite dish above the Receiving Bay, shoot it with the Wave Gun in its combined mode. Follow it into Tunnel 11, opening doors and shooting or using an explosive when it sticks out of reach near the ceiling. Guide it to the socket in front of the pyramid.",
            "quick": "Wave Gun the satellite sphere, then escort it through Tunnel 11.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-satellite-dish-above-spawn.webp",
                "alt": "Satellite Dish Above Spawn"
              },
              {
                "src": "/images/chronicles/moon/moon-vril-sphere-entering-vril-interface.webp",
                "alt": "Vril Sphere entering Vril Interface"
              }
            ]
          },
          {
            "id": "sphere-3",
            "text": "Kill 25 zombies close to the newly exposed MPD tube so their souls enter it. When it is full, use the nearby lever to open the pyramid and reveal Samantha. Cryogenic Slumber Party and its temporary Death Machine mark the first milestone; continue below for the full ending.",
            "quick": "Fill the first tube and open the MPD.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-power-switch-next-to-mpd.webp",
                "alt": "Power Switch Next to M.P.D."
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "device",
        "title": "Bring back the plates and charge the Golden Rod",
        "steps": [
          {
            "id": "device-plates",
            "text": "Bring a Gersh Device to Area 51. Throw a grenade at the hexagonal plates on the shelf to the right of the teleporter, knocking them down. Throw a Gersh close enough to pull the plates onto the teleporter, then return to the Moon.",
            "quick": "Grenade and Gersh the Area 51 plates onto the pad.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-hex-plates-shelf.webp",
                "alt": "Hexagonal Plates on Shelf"
              }
            ]
          },
          {
            "id": "device-qed",
            "text": "The plates now lie beside Quick Revive. Throw a Q.E.D. at them to move them to the computer in the opposite corner of the Receiving Bay. Keep Q.E.D.s until the later sphere-transfer step.",
            "quick": "Q.E.D. the plates beside Quick Revive.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-hex-plates-near-quick-revive.webp",
                "alt": "Hexagonal Plates near Quick Revive"
              },
              {
                "src": "/images/chronicles/moon/moon-computer-in-spawn.webp",
                "alt": "Computer in Spawn"
              }
            ]
          },
          {
            "id": "device-cable",
            "text": "Pick up the silver S-shaped cable in or just outside the laboratories. Sweep shelves, floors and corners on all three levels, then the outside area near Mule Kick. The photographs show its appearance and outside search area, not every possible spawn. Connect it between the Receiving Bay computer and plates.",
            "quick": "Find and connect the S-shaped cable.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-s-cable.webp",
                "alt": "S shaped cable appearance (location in the image is stairs leading to the third floor of the lab)"
              },
              {
                "src": "/images/chronicles/moon/moon-s-cables-outside-spawn.webp",
                "alt": "S Cables Outside the Laboratory"
              },
              {
                "src": "/images/chronicles/moon/moon-s-cable-connected-to-machine.webp",
                "alt": "S shaped cable connected to computer"
              }
            ]
          },
          {
            "id": "device-charge",
            "text": "Richtofen places his Golden Rod/Vril Device between the plates. Keep interacting with the computer through Maxis’s dialogue until the charge completes and the device glows. Pick the charged device back up before leaving.",
            "quick": "Richtofen charges and retrieves the Vril Device.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-vril-device-glowing.webp",
                "alt": "Vril Device fully powered"
              }
            ]
          }
        ],
        "tools": []
      },
      {
        "id": "rockets",
        "title": "Soul transfer and Earth’s destruction",
        "steps": [
          {
            "id": "rockets-1",
            "text": "At the MPD, fill all four exposed tubes with 25 nearby zombie souls apiece. Richtofen inserts the charged device at the front of the pyramid, triggering the body swap and his permanent perks. After the dialogue, throw a Q.E.D. at the sphere in front of the MPD to send it back toward the computers.",
            "quick": "Fill four tubes, perform the body swap and Q.E.D. the sphere.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-filled-soul-containers.webp",
                "alt": "Filled Souls Containers"
              }
            ]
          },
          {
            "id": "rockets-2",
            "text": "Complete three more Samantha Says games at the outside computers. Replace Q.E.D.s with Gersh Devices, then throw a Gersh beside the sphere to the right of the computers. A countdown begins and three rockets strike Earth. Big Bang Theory and permanent perks for the team confirm the full BO1 ending; you can continue playing afterwards.",
            "quick": "Complete three final computer games, then Gersh the sphere.",
            "images": [
              {
                "src": "/images/chronicles/moon/moon-vril-sphere-next-to-computers.webp",
                "alt": "Vril Sphere next to computers"
              },
              {
                "src": "/images/chronicles/moon/moon-earth-destroyed.webp",
                "alt": "Earth Destroyed"
              }
            ]
          }
        ],
        "tools": []
      }
    ],
    "sidePhases": [
      {
        "id": "hacker-uses",
        "title": "Useful Hacker interactions",
        "steps": [
          {
            "id": "hack-powerups",
            "text": "Hack a power-up for 5,000 points to convert it into Max Ammo. Protect the player while the hack completes; do not pick up the drop first.",
            "quick": "Convert a spare power-up into Max Ammo."
          },
          {
            "id": "hack-box",
            "text": "Hack an unclaimed Box weapon to reroll it for 600 points. Hacking the rerolled result lets a teammate take it and refunds points to the hacker. Hacking a perk machine for a perk you own removes that perk and refunds its purchase price.",
            "quick": "Reroll Box weapons or refund an unwanted perk."
          },
          {
            "id": "hack-sharing",
            "text": "Hack a teammate to transfer 500 of your points to them. This is useful when a teammate needs a door or perk; it does not generate free points.",
            "quick": "Transfer points to a teammate."
          }
        ],
        "tools": [],
        "group": "Side Quests"
      },
      {
        "id": "music",
        "title": "Coming Home, electronic songs and Nightmare",
        "steps": [
          {
            "id": "moon-coming-home",
            "text": "Interact with three helmet-wearing teddy bears: on the crates below the Receiving Bay, in the airlock between Tunnel 6 and power, and in the broken wall near Stamin-Up. The third starts Coming Home.",
            "quick": "Find the three astronaut teddy bears."
          },
          {
            "id": "moon-electronic",
            "text": "For the short electronic tracks, interact with the lab computers by the upper-floor weapon wall/Deadshot (Damned), the consoles by the Tunnel 11 door to power (Coming Home), and the floor-2 lab computers by the window crates (Pareidolia). These do not advance the main quest.",
            "quick": "Try the three electronic computer songs."
          },
          {
            "id": "moon-nightmare",
            "text": "Nightmare is tied to the One Giant Leap setup in co-op: both tunnels must be breached, one player on the Receiving Bay side bleeds out, and the surviving player across the blocked routes finishes the round to respawn them. This deliberately costs a life; attempt it only when the team is ready for that optional challenge.",
            "quick": "Complete the co-op One Giant Leap setup for Nightmare."
          }
        ],
        "tools": []
      },
      {
        "id": "survival",
        "title": "Astronaut, gravity and the Biodome",
        "steps": [
          {
            "id": "moon-astronaut",
            "text": "The astronaut walks slowly but teleports a player and steals a perk if it catches them. Back away while shooting it; keep distance when it explodes. Call its position before a teammate runs around the same blind corner.",
            "quick": "Give the astronaut space and warn teammates."
          },
          {
            "id": "moon-air",
            "text": "The P.E.S. protects you in vacuum, while the Hacker replaces it. A breached tunnel remains depressurised after its excavator retracts, and broken laboratory windows can also remove air. Swap to the P.E.S. before crossing those areas. Avoid a long Hacker search while suffocating.",
            "quick": "Swap equipment before crossing depressurised rooms."
          },
          {
            "id": "moon-pads",
            "text": "Biodome launch pads follow a set route and can send you into an unsafe landing. Keep the landing zone clear and avoid activating one accidentally while circling a horde. PhD Flopper protects against fall damage in this edition; it does not supply oxygen.",
            "quick": "Watch the Biodome pads and your landing zone."
          }
        ],
        "tools": []
      }
    ],
    "sources": [
      "https://www.reddit.com/r/CODZombies/wiki/moon/",
      "https://www.codzombiesguides.com/main-quests/black-ops-1/moon/"
    ],
    "reviewed": "2026-10-03",
    "reviewNote": "Written for Black Ops (2010), with its title updates; mobile editions and modded maps can differ. Community guides and illustrated references were cross-checked on 3 October 2026. Gameplay: Activision / Treyarch; photographs: the credited community authors below. Reused photographs may show a remaster of the same location; the instructions describe this edition. Source review and software checks are not an in-game playthrough."
  }
]
