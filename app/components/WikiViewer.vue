<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{ html?: string }>()

const content = ref<string>(props.html || '')
watchEffect(() => { content.value = props.html || '' })

function decodeEntities(input: string) {
  if (!input) return ''
  return input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Process HTML to inject IDs and build TOC
const processed = computed(() => {
  const res = { html: content.value || '', toc: [] as Array<{ id: string; text: string; level: number }> }
  if (!content.value) return res
  // Pre-clean: decode HTML entities and strip Reddit SC_OFF/SC_ON markers
  let raw = decodeEntities(content.value)
  raw = raw.replace(/<!--\s*SC_OFF\s*-->/g, '').replace(/<!--\s*SC_ON\s*-->/g, '')

  // Avoid DOMParser on SSR
  if (typeof window === 'undefined') {
    res.html = raw
    return res
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')
  // Prefer inner of Reddit wiki container
  const wikiRoot = doc.querySelector('.md.wiki') || doc.body
  // Remove Reddit's internal TOC block (we have our own sidebar)
  const internalToc = wikiRoot.querySelector('.toc')
  if (internalToc) internalToc.remove()

  // Improve external links usability (open in new tab)
  wikiRoot.querySelectorAll('a[href^="http"]')
    .forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer') })
  const headings = Array.from(doc.querySelectorAll('h2, h3')) as HTMLHeadingElement[]
  res.toc = headings.map((h) => {
    const base = (h.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const id = h.id || base
    h.id = id
    return { id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 }
  })
  res.html = wikiRoot.innerHTML
  return res
})

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 p-4 lg:p-8">
    <!-- Sidebar TOC -->
    <aside class="sticky top-4 self-start space-y-4">
      <div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="mdi:book-open-page-variant" class="text-cyan-300" />
          <h2 class="text-sm font-semibold tracking-wide text-cyan-200">Quick Navigation</h2>
        </div>
        <nav class="space-y-1 max-h-[60vh] overflow-auto pr-2">
          <button
            v-for="item in processed.toc"
            :key="item.id + item.text"
            class="block w-full text-left text-xs lg:text-sm px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition"
            :style="item.level === 3 ? 'margin-left: 12px' : ''"
            @click="scrollToId(item.id)"
          >
            {{ item.text }}
          </button>
        </nav>
      </div>

      <!-- Important Info block -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="mdi:lightning-bolt" class="text-yellow-300" />
          <h2 class="text-sm font-semibold tracking-wide text-yellow-200">High-Intensity Tips</h2>
        </div>
        <ul class="text-xs lg:text-sm space-y-2 text-slate-200">
          <li>Use the Quick Navigation to jump to steps fast.</li>
          <li>Look for bold headings for key objectives.</li>
          <li>Collapse long sections on mobile via your browser’s reader.</li>
        </ul>
      </div>
    </aside>

    <!-- Main Content -->
    <section class="space-y-4">
      <div class="backdrop-blur-2xl bg-white/10 border border-white/10 shadow-2xl rounded-3xl p-6 lg:p-8">
        <article class="prose prose-invert max-w-none">
          <!-- Render HTML from Reddit wiki -->
          <div v-html="processed.html" />
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Improve readability in dark + glassmorphism */
.prose :where(h1,h2,h3,h4) {
  scroll-margin-top: 1.5rem;
}
.prose :where(h1) {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  line-height: 1.2;
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
}
.prose :where(h2) {
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
  line-height: 1.25;
  margin-top: 1.1rem;
  margin-bottom: 0.6rem;
}
.prose :where(h3) {
  font-size: clamp(1.2rem, 1.8vw, 1.4rem);
  line-height: 1.3;
  margin-top: 0.9rem;
  margin-bottom: 0.5rem;
}

.prose :where(hr) {
  border-color: rgba(255,255,255,0.12);
  margin: 1rem 0;
}

.prose :where(a) {
  color: #67e8f9; /* cyan-300 */
  text-decoration: none;
}
.prose :where(a:hover) {
  color: #22d3ee; /* cyan-400 */
  text-decoration: underline;
}

.prose :where(code) {
  background: rgba(255,255,255,0.08);
  padding: 0.15rem 0.35rem;
  border-radius: 0.35rem;
}
.prose :where(table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  overflow: hidden;
  display: block;
  overflow-x: auto;
}
.prose :where(thead th) {
  background: rgba(255,255,255,0.12);
  color: #e2e8f0; /* slate-200 */
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.prose :where(tbody td) {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.prose :where(tbody tr:nth-child(odd)) {
  background: rgba(255,255,255,0.04);
}

.prose :where(ul, ol) {
  margin-left: 1rem;
}
.prose :where(li) {
  margin: 0.25rem 0;
}
</style>
