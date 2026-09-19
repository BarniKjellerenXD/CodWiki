import { isRef, watch, onMounted, type Ref } from 'vue'

// Persist reactive inputs only after hydration; never write defaults over a saved run.
export function useToolState(id: string, fields: Record<string, Ref<any> | Record<string, any>>) {
  let ready = false
  const key = `codwiki-tool-${id}-v1`
  onMounted(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}')
      for (const [name, field] of Object.entries(fields)) {
        if (!(name in saved)) continue
        const initial = isRef(field) ? field.value : field
        const value = saved[name]
        if (initial !== null && (Array.isArray(initial) !== Array.isArray(value) || typeof initial !== typeof value)) continue
        if (isRef(field)) field.value = value
        else if (value && typeof value === 'object') Object.assign(field, value)
      }
    } catch {}
    ready = true
  })
  watch(() => Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, isRef(field) ? field.value : field])), value => {
    if (ready) { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }
  }, { deep: true })
}
