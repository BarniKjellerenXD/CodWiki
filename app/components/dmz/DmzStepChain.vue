<script setup lang="ts">
import { stepKind } from '#shared/dmz-guide.mjs'

// An op's objectives as a chain of icons, in order. Long chains wrap.
const props = withDefaults(defineProps<{ steps: string[], label: string, compact?: boolean }>(), { compact: false })
const items = computed(() => props.steps.map(text => ({ text, kind: stepKind(text) })))
</script>

<template>
  <ol class="sc" :class="{ 'sc--compact': compact }" :aria-label="label">
    <li v-for="(item, index) in items" :key="index" class="sc-step" :data-kind="item.kind.id">
      <span class="sc-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path :d="item.kind.icon" /></svg>
      </span>
      <span class="sc-text"><span class="sc-kind dmz-mono">{{ String(index + 1).padStart(2, '0') }} · {{ item.kind.label }}</span>{{ item.text }}</span>
    </li>
  </ol>
</template>

<style scoped>
.sc { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: 0.5rem; counter-reset: step; }
.sc-step { position: relative; display: grid; grid-template-rows: auto 1fr; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--dz-line); background: rgba(22, 26, 25, 0.55); }
/* An arrow into the next step, where the next step sits to the right. */
.sc-step:not(:last-child)::after { content: ''; position: absolute; right: -0.4rem; top: 1.45rem; z-index: 1; width: 0.6rem; height: 0.6rem; border-top: 1.5px solid var(--dz-line-strong); border-right: 1.5px solid var(--dz-line-strong); background: var(--dz-bg); transform: rotate(45deg); }
.sc-icon { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 50%; border: 1.5px solid var(--sc-c, var(--dz-ink-2)); color: var(--sc-c, var(--dz-ink-2)); }
.sc-icon svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.sc-text { display: grid; gap: 0.2rem; font-size: 0.9375rem; line-height: 1.3; color: var(--dz-ink); }
.sc-kind { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sc-c, var(--dz-muted)); }
.sc [data-kind='kill'] { --sc-c: #ef7a5a; }
.sc [data-kind='defend'] { --sc-c: #9fd8cf; }
.sc [data-kind='bomb'] { --sc-c: #e8a04f; }
.sc [data-kind='code'], .sc [data-kind='hack'] { --sc-c: #b6c8f0; }
.sc [data-kind='tower'], .sc [data-kind='drive'] { --sc-c: #d8c47c; }
.sc [data-kind='rescue'], .sc [data-kind='exfil'] { --sc-c: #a9d98a; }
.sc [data-kind='loot'] { --sc-c: #ddb363; }
/* Icons only, wrapping onto a second line on narrow cards. Doubled classes
   keep these ahead of the phone layout below. */
.sc.sc--compact { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.sc--compact .sc-step.sc-step { display: block; padding: 0.25rem; border: 0; background: none; }
.sc--compact .sc-step.sc-step::after { display: none; }
.sc--compact .sc-text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.sc--compact .sc-icon { width: 1.875rem; height: 1.875rem; }
@media (max-width: 599px) {
  .sc { grid-template-columns: 1fr; }
  .sc-step { grid-template-columns: auto 1fr; grid-template-rows: none; align-items: center; padding: 0.5rem 0.75rem; }
  .sc-step:not(:last-child)::after { right: auto; left: 1.85rem; top: auto; bottom: -0.4rem; transform: rotate(135deg); }
}
</style>
