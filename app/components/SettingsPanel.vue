<template>
  <div class="settings">
    <button
      class="settings-trigger"
      type="button"
      aria-label="Open settings"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Icon name="mdi:cog-outline" />
    </button>

    <Transition name="pop">
      <div v-if="open" class="settings-scrim" @click.self="open = false">
        <div class="settings-panel" role="dialog" aria-label="Settings">
          <header class="settings-head">
            <div>
              <h2>Settings</h2>
              <p>Make it yours</p>
            </div>
            <button class="settings-close" type="button" aria-label="Close settings" @click="open = false">
              <Icon name="mdi:close" />
            </button>
          </header>

          <section class="settings-section">
            <h3>Theme</h3>
            <div class="theme-grid">
              <button
                v-for="t in themes"
                :key="t.id"
                type="button"
                class="theme-card"
                :class="{ active: state.theme === t.id }"
                @click="setTheme(t.id)"
              >
                <span class="theme-swatch" :style="{ background: t.swatch }" />
                <span class="theme-name">{{ t.name }}</span>
                <span class="theme-desc">{{ t.description }}</span>
              </button>
            </div>
          </section>

          <section class="settings-section">
            <h3>Text size</h3>
            <div class="segmented">
              <button
                v-for="s in scales"
                :key="s.id"
                type="button"
                :class="{ active: state.fontScale === s.id }"
                @click="setFontScale(s.id)"
              >{{ s.label }}</button>
            </div>
          </section>

          <footer class="settings-foot">Preferences are saved on this device.</footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { state, themes, setTheme, setFontScale, init } = useSettings()
const open = ref(false)

const scales: { id: 'compact' | 'default' | 'relaxed', label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'default', label: 'Default' },
  { id: 'relaxed', label: 'Relaxed' },
]

onMounted(() => {
  init()
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') open.value = false
  })
})
</script>

<style scoped>
.settings-trigger {
  position: fixed;
  right: 1.25rem;
  top: 1.25rem;
  z-index: 60;
  width: 2.6rem;
  height: 2.6rem;
  display: grid;
  place-items: center;
  border-radius: 9999px;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--muted);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.settings-trigger:hover {
  color: var(--gold-bright);
  border-color: var(--gold-border);
  transform: rotate(20deg);
}

.settings-scrim {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 4.5rem 1.25rem 1.25rem;
  background: rgba(0, 0, 0, 0.35);
}

.settings-panel {
  width: min(22rem, 100%);
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.35rem 1.4rem;
  box-shadow: var(--shadow-lg);
}

.settings-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.9rem;
  margin-bottom: 1.1rem;
  border-bottom: 1px solid var(--line);
}

.settings-head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
}

.settings-head p {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--faint);
}

.settings-close {
  flex: none;
  width: 1.9rem;
  height: 1.9rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--muted);
  cursor: pointer;
}

.settings-close:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.settings-section {
  margin-bottom: 1.35rem;
}

.settings-section h3 {
  margin: 0 0 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.theme-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.theme-card:hover {
  border-color: var(--line-strong);
  background: var(--surface-3);
}

.theme-card.active {
  border-color: var(--gold);
  background: var(--gold-dim);
}

.theme-swatch {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  margin-bottom: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.theme-name {
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--text);
}

.theme-desc {
  font-size: 0.68rem;
  color: var(--faint);
}

.segmented {
  display: flex;
  gap: 0.4rem;
}

.segmented button {
  flex: 1;
  padding: 0.5rem 0.4rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.segmented button:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.segmented button.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--on-gold);
}

.switch {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: var(--muted);
  cursor: pointer;
  line-height: 1.45;
}

.switch input {
  margin-top: 0.15rem;
  flex: none;
}

.settings-foot {
  padding-top: 0.9rem;
  border-top: 1px solid var(--line);
  font-size: 0.72rem;
  color: var(--faint);
}

.section-note {
  margin: 0.6rem 0 0;
  font-size: 0.72rem;
  color: var(--faint);
  line-height: 1.5;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.16s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

.pop-enter-active .settings-panel {
  animation: pop-in 0.2s ease;
}

@keyframes pop-in {
  from {
    transform: translateY(-8px) scale(0.98);
    opacity: 0;
  }
}

@media (max-width: 560px) {
  .settings-trigger {
    top: auto;
    bottom: 4.75rem;
  }

  .settings-scrim {
    padding: 1rem;
    align-items: center;
  }

  .settings-panel {
    max-height: calc(100vh - 2rem);
  }
}
</style>
