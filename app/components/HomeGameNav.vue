<script setup lang="ts">
const props = defineProps<{ games: { id: string; name: string; shortName?: string; planned?: boolean }[] }>()
const emit = defineEmits<{ jump: [id: string] }>()
const active = ref(props.games[0]?.id || 'bo7')
const shortName = (id: string) => props.games.find(game => game.id === id)?.shortName || id.toUpperCase()
let frame = 0
function updateActive() {
  frame = 0
  const targets = [...document.querySelectorAll<HTMLElement>('[data-game-target]')]
  if (!targets.length) return
  const offset = window.matchMedia('(min-width: 1100px)').matches ? 64 : 112
  const current = targets.filter(target => target.getBoundingClientRect().top <= offset).at(-1) || targets[0]
  active.value = current.dataset.gameTarget || 'bo7'
}
function scheduleUpdate() { if (!frame) frame = requestAnimationFrame(updateActive) }
function jump(id: string) { active.value = id; emit('jump', id) }
onMounted(() => {
  updateActive()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
})
</script>

<template>
  <nav class="game-jumps" aria-label="Jump to game">
    <div class="game-jump-mobile">
      <label for="home-game-jump">Jump to</label>
      <select id="home-game-jump" :value="active" aria-label="Jump to game" @change="jump(($event.target as HTMLSelectElement).value)">
        <optgroup v-for="planned in [false, true]" :key="String(planned)" :label="planned ? 'Guides planned' : 'Guides available'">
          <option v-for="game in games.filter(game => !!game.planned === planned)" :key="game.id" :value="game.id">{{ game.name }}</option>
        </optgroup>
        <option value="tools">Puzzle tools</option>
      </select>
    </div>
    <div class="game-jump-desktop">
      <p>Jump to game</p>
      <template v-for="(game,index) in games" :key="game.id">
      <p v-if="game.planned && !games[index-1]?.planned" class="planned-label">Guides planned</p>
      <a :href="`#game-${game.id}`" :aria-label="game.name" :title="game.name" :aria-current="active === game.id ? 'location' : undefined" @click.prevent="jump(game.id)">
        <span>{{ shortName(game.id) }}</span><svg v-if="active === game.id" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
      </a>
      </template>
      <a class="tools-jump" href="#tools" :aria-current="active === 'tools' ? 'location' : undefined" @click.prevent="jump('tools')">Puzzle tools</a>
      <a class="top-jump" href="#top" @click.prevent="jump('top')">Back to top</a>
    </div>
  </nav>
</template>

<style scoped>
.game-jumps{position:sticky;top:0;z-index:20;align-self:start;background:var(--bg);margin-bottom:1.5rem;border-bottom:1px solid var(--line)}
.game-jump-mobile{display:flex;align-items:center;gap:.9rem;padding:.65rem 0}
.game-jump-mobile label{font-size:.82rem;color:var(--muted);white-space:nowrap}
.game-jump-mobile select{min-width:0;width:100%;min-height:44px;padding:.65rem 2rem .65rem .8rem;background:var(--surface);color:var(--text);border:1px solid var(--line-strong);border-radius:var(--radius-sm);font:inherit;font-size:.9rem}
.game-jump-mobile select:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.game-jump-desktop{display:none}
@media(min-width:1100px){
 .game-jumps{top:2rem;margin:0;border:0;max-height:calc(100dvh - 4rem);overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent;padding:3px}
 .game-jump-mobile{display:none}
 .game-jump-desktop{display:block}
 .game-jump-desktop p{font-size:.8rem;color:var(--muted);margin:0 0 1rem;padding-left:.9rem}
 .game-jump-desktop a{display:flex;align-items:center;justify-content:space-between;gap:.5rem;min-height:40px;padding:.55rem .9rem;border-left:1px solid var(--line);font-size:.9rem;color:var(--muted);text-decoration:none}
 .game-jump-desktop .planned-label{margin:1.25rem 0 .6rem;font-size:.72rem}
 .game-jump-desktop a:hover{color:var(--text);background:var(--surface)}
 .game-jump-desktop a[aria-current]{color:var(--gold);border-left-color:var(--gold);background:var(--gold-dim);font-weight:600}
 .game-jump-desktop a:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
 .game-jump-desktop .tools-jump{margin-top:1rem}
 .game-jump-desktop .top-jump{font-size:.8rem;margin-top:1rem;border:0}
}
</style>
