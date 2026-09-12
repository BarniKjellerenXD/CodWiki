<script setup lang="ts">
// @ts-ignore
import WikiViewer from '../../components/WikiViewer.vue'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// nuxt-api-party composables
declare const useRedditData: <T = any>(path: string) => {
  data: { value: T },
  refresh: () => void,
  error: { value: any },
  status: { value: 'idle'|'pending'|'success'|'error' },
  clear: () => void
}
// $reddit behaves like $fetch for direct calls
declare const $reddit: (path: string, opts?: any) => Promise<any>

const route = useRoute()
const slug = String(route.params.page || '')

// Add timestamp to avoid CDN/browser caching older wiki HTML
const { data, error, status } = useRedditData(`r/CODZombies/wiki/${encodeURIComponent(slug)}.json?t=${Date.now()}`)

const htmlComputed = computed<string>(() => {
  const raw = (data as any)?.value
  return raw?.data?.content_html || '<p>No content</p>'
})
const html = ref<string>(htmlComputed.value)

// After hydration, force latest by reading newest revision and fetching that version
onMounted(async () => {
  try {
    status.value = 'pending'
    const revs = await $reddit(`/r/CODZombies/wiki/revisions/${encodeURIComponent(slug)}.json?limit=1`)
    const first = revs?.data?.children?.[0]?.data || revs?.data?.children?.[0] || null
    const revId = first?.id || first?.revision || null
    if (revId) {
      const pageRes = await $reddit(`/r/CODZombies/wiki/${encodeURIComponent(slug)}.json?v=${revId}`)
      html.value = pageRes?.data?.content_html || html.value
    }
    status.value = 'success'
  } catch (e) {
    status.value = 'error'
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-6 lg:py-10">
    <header class="px-4 lg:px-8 mb-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl lg:text-3xl font-bold text-white capitalize">{{ slug.replace(/-/g, ' ') }}</h1>
        <NuxtLink to="/" class="text-sm text-cyan-300 hover:text-cyan-200">Back to search</NuxtLink>
      </div>
    </header>

    <div v-if="status.value === 'pending'" class="px-4 lg:px-8">
      <div class="animate-pulse h-8 w-48 bg-white/10 rounded-lg mb-3" />
      <div class="animate-pulse h-64 bg-white/10 rounded-2xl" />
    </div>

    <div v-else-if="status.value === 'error'" class="px-4 lg:px-8">
      <div class="backdrop-blur-xl bg-red-400/15 border border-red-500/30 text-red-200 rounded-2xl p-4">
        Failed to load wiki content. Try again.
      </div>
    </div>

    <div v-else class="px-0">
      <WikiViewer :html="html" />
    </div>
  </div>
</template>
