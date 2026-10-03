<script setup lang="ts">
const props = defineProps<{ mapId: string }>()
// Sources already recorded in the map and puzzle verification documents. The
// older Reddit HTML import did not record an exact wiki revision here.
const references: Record<string, { label: string; href: string }[]> = {
  'ashes-of-the-damned': [
    { label: 'mmmrkennedy illustrated guide', href: 'https://mmmrkennedy.com/games/BO7/ashes_of_the_damned/ashes_of_the_damned_guide' },
    { label: 'Official tactical map', href: 'https://www.callofduty.com/guides/blackops7/zombies/ashes-of-the-damned' }
  ],
  'astra-malorum': [
    { label: 'Steam Community walkthrough', href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3624863442' },
    { label: 'Official tactical map', href: 'https://www.callofduty.com/guides/blackops7/zombies/astra-malorum' }
  ],
  'kowakujo': [
    { label: 'COD Zombies Guides illustrated quest', href: 'https://codzombiesguides.com/main-quests/black-ops-7/kowakujo/' },
    { label: 'Official tactical map', href: 'https://www.callofduty.com/guides/blackops7/zombies/kowakujo' }
  ],
  'paradox-junction': [
    { label: 'COD Zombies Guides illustrated quest', href: 'https://codzombiesguides.com/main-quests/black-ops-7/paradox-junction/' },
    { label: 'Official tactical map', href: 'https://www.callofduty.com/guides/blackops7/zombies/paradox-junction' }
  ],
  'rex-infernus': [
    { label: 'COD Zombies Guides illustrated quest', href: 'https://codzombiesguides.com/main-quests/black-ops-7/rex-infernus/' },
    { label: 'COD Zombies Guides interactive map', href: 'https://www.codzombiesguides.com/maps/rex-infernus/' }
  ],
  'totenreich': [
    { label: 'COD Zombies Guides interactive map', href: 'https://www.codzombiesguides.com/maps/totenreich/' },
    { label: 'Community Uranium Pincers model and explanation', href: 'https://www.reddit.com/r/CODZombies/comments/1t3q1i1/experimental_totenreich_claw_machine_solver/' }
  ]
}
const sources = computed(() => references[props.mapId])
</script>

<template>
  <section v-if="sources">
    <h2 id="guide-sources">Sources and review</h2>
    <p>Guide text is adapted from the r/CODZombies community wiki with AI assistance. The references below also informed the map and puzzle helpers. Source and software checks do not replace an in-game playthrough.</p>
    <ul>
      <li><a href="https://www.reddit.com/r/CODZombies/wiki/index/" target="_blank" rel="noopener noreferrer">r/CODZombies community wiki index ↗</a></li>
      <li v-for="source in sources" :key="source.href"><a :href="source.href" target="_blank" rel="noopener noreferrer">{{ source.label }} ↗</a></li>
    </ul>
  </section>
</template>
