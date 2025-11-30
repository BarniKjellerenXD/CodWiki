<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mapSlug = ref('')

function goToMap() {
  const slug = mapSlug.value.trim()
  if (!slug) return
  router.push(`/wiki/${encodeURIComponent(slug)}`)
}

// Static featured guides (manual entries)
const featuredGuides = [
  { title: 'Ashes of the Damned', to: '/guides/ashes-of-the-damned', desc: 'Complete map breakdown, quests, relics, and more.', img: '/images/ashes-hero.jpg' }
]
</script>

<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">COD Zombies Wiki Viewer</h1>
      <p class="text-slate-300 mt-2">Type a map slug to open its wiki page, or use the quick entries below.</p>
    </div>

    <div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="mapSlug"
          type="text"
          placeholder="e.g. ashes-of-the-damned"
          class="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          @keydown.enter="goToMap"
        />
        <button
          class="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold"
          @click="goToMap"
        >Open Wiki</button>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-slate-200 mb-3">Quick Entries</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <NuxtLink
          v-for="g in featuredGuides" :key="g.to"
          :to="g.to"
          class="group backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition flex flex-col"
        >
          <div v-if="g.img" class="h-32 w-full overflow-hidden relative">
            <img :src="g.img" :alt="g.title" class="object-cover w-full h-full group-hover:scale-[1.06] transition-transform duration-400" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent"></div>
          </div>
          <div class="p-4 flex flex-col flex-1 justify-between">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="font-semibold">{{ g.title }}</div>
                <div class="text-xs text-white/70">{{ g.desc }}</div>
              </div>
              <span class="opacity-0 group-hover:opacity-100 text-cyan-300 text-sm">→</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
