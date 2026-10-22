<script setup lang="ts">
// Parent route for the Intel concept drafts under /dmz/lab. It only carries the
// styles the drafts share; delete it with the lab once a direction is chosen.
</script>

<template>
  <div class="lab"><NuxtPage /></div>
</template>

<style>
/* Shared by the /dmz/lab drafts only. */
.lab .lab-lede { max-width: 46rem; margin: 1rem 0 0; color: #dcd9cb; font-size: 1.0625rem; }
.lab .lab-badge { flex: none; display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid currentColor; font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.lab .lab-badge.is-official { color: var(--dz-accent); }
.lab .lab-badge.is-confirmed { color: var(--dz-green); }
.lab .lab-badge.is-reported { color: var(--dz-teal); border-style: dashed; }
.lab .lab-kind { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.lab .lab-h2 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.lab .lab-h3 { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.lab .lab-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.lab .lab-chip { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.95rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.45); color: var(--dz-ink-2) !important; font: inherit; font-size: 0.975rem; font-weight: 500; text-decoration: none; cursor: pointer; }
.lab .lab-chip:hover { border-color: var(--dz-ink); color: #fff !important; }
.lab .lab-chip[aria-pressed='true'], .lab .lab-chip[aria-current='true'] { background: var(--dz-ink); border-color: var(--dz-ink); color: var(--dz-bg) !important; }
.lab .lab-chip .dmz-mono { font-size: 0.7rem; color: inherit; opacity: 0.75; }
.lab .lab-card { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 1.125rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 16px; }
.lab .lab-search { display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.lab .lab-search:focus-within { border-color: var(--dz-ink); }
.lab .lab-search svg { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; stroke-linecap: round; }
.lab .lab-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.lab .lab-search input::placeholder { color: #9a9b8f; }
.lab .lab-icon { width: 1.5rem; height: 1.5rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.lab .lab-link { display: inline-flex; align-items: center; min-height: 2.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.lab .lab-facts { display: grid; gap: 0.25rem; margin: 0; }
.lab .lab-facts > div { display: grid; grid-template-columns: 7rem 1fr; gap: 0.75rem; padding: 0.375rem 0.625rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--dz-line-strong); }
.lab .lab-facts dt { padding-top: 0.15rem; font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.lab .lab-facts dd { margin: 0; color: #e3e0d0; font-size: 0.95rem; white-space: pre-line; }
.lab .lab-empty { margin: 0; padding: 1rem 1.25rem; border: 1px dashed var(--dz-line-strong); border-radius: 14px; color: var(--dz-muted); }
@media (max-width: 899px) {
  .lab .lab-facts > div { grid-template-columns: 5.5rem 1fr; }
}
</style>
