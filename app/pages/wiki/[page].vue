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
  <div class="wiki-page">
    <header class="wiki-header">
      <div>
        <span class="wiki-eyebrow">Wiki page</span>
        <h1>{{ slug.replace(/-/g, ' ') }}</h1>
      </div>
      <NuxtLink to="/" class="wiki-back">← Back to search</NuxtLink>
    </header>

    <div v-if="status.value === 'pending'" class="wiki-skeleton">
      <div class="sk sk-title" />
      <div class="sk sk-body" />
    </div>

    <div v-else-if="status.value === 'error'" class="wiki-error">
      Failed to load wiki content. Try again.
    </div>

    <WikiViewer v-else :html="html" />
  </div>
</template>

<style scoped>
.wiki-page {
  padding: 1.5rem 0 0;
}

.wiki-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 1.5rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.wiki-eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.5rem;
}

.wiki-header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: capitalize;
  color: var(--text);
}

.wiki-back {
  font-size: 0.85rem;
  color: var(--muted);
  text-decoration: none;
}

.wiki-back:hover {
  color: var(--gold-bright);
}

.wiki-skeleton,
.wiki-error {
  max-width: var(--content-width);
  margin: 1.5rem auto 0;
  padding: 0 1.5rem;
}

.sk {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.sk-title {
  height: 2rem;
  width: 16rem;
  margin-bottom: 1rem;
  animation: pulse 1.6s ease-in-out infinite;
}

.sk-body {
  height: 20rem;
  animation: pulse 1.6s ease-in-out infinite;
}

.wiki-error {
  background: rgba(201, 118, 106, 0.12);
  border: 1px solid rgba(201, 118, 106, 0.45);
  border-radius: var(--radius);
  color: #e6b3aa;
  padding: 1rem 1.25rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (max-width: 640px) {
  .wiki-header {
    padding: 0 1rem 1rem;
  }
}
</style>
