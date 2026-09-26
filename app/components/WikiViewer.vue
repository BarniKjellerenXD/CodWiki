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
  <div class="wiki">
    <aside class="wiki-aside">
      <div class="wiki-panel">
        <div class="wiki-head">
          <Icon name="mdi:book-open-page-variant" />
          <span>On this page</span>
        </div>
        <nav class="wiki-nav">
          <button
            v-for="item in processed.toc"
            :key="item.id + item.text"
            class="wiki-link"
            :class="item.level === 3 ? 'lvl-3' : 'lvl-2'"
            @click="scrollToId(item.id)"
          >
            {{ item.text }}
          </button>
        </nav>
      </div>

      <div class="wiki-panel">
        <div class="wiki-head is-tip">
          <Icon name="mdi:lightning-bolt" />
          <span>Reading tips</span>
        </div>
        <ul class="wiki-tips">
          <li>Use the list above to jump to a step.</li>
          <li>Bold headings mark key objectives.</li>
          <li>Click any image to zoom in.</li>
        </ul>
      </div>
    </aside>

    <section class="wiki-main">
      <article class="prose">
        <div v-html="processed.html" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.wiki {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 2rem;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

.wiki-aside {
  position: sticky;
  top: 2rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wiki-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow);
}

.wiki-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  padding-bottom: 0.65rem;
}

.wiki-head.is-tip {
  color: var(--muted);
}

.wiki-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 60vh;
  overflow-y: auto;
}

.wiki-link {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.4;
  padding: 0.42rem 0.55rem;
  cursor: pointer;
  transition: background-color 0.14s ease, color 0.14s ease;
}

.wiki-link:hover {
  background: var(--surface-2);
  color: var(--text);
}

.wiki-link.lvl-3 {
  padding-left: 1.5rem;
  font-size: 0.8rem;
}

.wiki-tips {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--muted);
}

.wiki-tips li::marker {
  color: var(--gold);
}

.wiki-main {
  min-width: 0;
}

.wiki-main .prose {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 2rem 2.25rem 2.5rem;
  box-shadow: var(--shadow);
  max-width: none;
}

@media (max-width: 1023px) {
  .wiki {
    grid-template-columns: minmax(0, 1fr);
    padding: 1rem 1rem 3rem;
  }

  .wiki-aside {
    position: static;
  }

  .wiki-main .prose {
    padding: 1.4rem 1.2rem 2rem;
  }
}
</style>
