<script setup lang="ts">
defineProps<{ groups: any[], pins: any[], active: string, closed: string[] }>()
const emit = defineEmits<{ go: [id:string], pin:[id:string], group:[id:string] }>()
</script>
<template>
  <nav class="guide-contents" aria-label="Guide sections" tabindex="0">
    <template v-if="pins.length"><p class="companion-label">Pinned</p><div v-for="item in pins" :key="item.id" class="contents-row"><button :aria-current="active === item.id ? 'location' : undefined" @click="emit('go',item.id)">{{ item.text }}</button><button class="pin" :aria-label="`Unpin ${item.text}`" @click="emit('pin',item.id)">−</button></div></template>
    <div v-for="group in groups" :key="group.id" class="contents-group">
      <div class="contents-row group-title">
        <button :aria-current="active === group.id ? 'location' : undefined" @click="emit('go',group.id)">{{ group.text }}</button>
        <button v-if="!group.id.startsWith('quick-') && group.id !== 'map-tools'" class="pin" :aria-label="`${pins.some(p=>p.id===group.id) ? 'Unpin' : 'Pin'} ${group.text}`" @click="emit('pin',group.id)">{{ pins.some(p=>p.id===group.id) ? '★' : '☆' }}</button>
        <button v-if="group.items.length" class="pin" :aria-label="`Toggle ${group.text} sections`" :aria-expanded="!closed.includes(group.id)" @click="emit('group',group.id)">{{ closed.includes(group.id) ? '+' : '−' }}</button>
      </div>
      <div v-show="!closed.includes(group.id)" v-for="item in group.items" :key="item.id" class="contents-row child"><button :aria-current="active === item.id ? 'location' : undefined" @click="emit('go',item.id)">{{ item.text }}</button><button class="pin" :aria-label="`${pins.some(p=>p.id===item.id) ? 'Unpin' : 'Pin'} ${item.text}`" @click="emit('pin',item.id)">{{ pins.some(p=>p.id===item.id) ? '−' : '＋' }}</button></div>
    </div>
  </nav>
</template>
<style scoped>
.guide-contents { display:block; flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden; scrollbar-width:thin; scrollbar-gutter:stable; overscroll-behavior:contain; }
.contents-row { display:flex; align-items:center; gap:.2rem; }
.contents-row button { background:transparent; border:0; border-radius:6px; color:var(--muted); text-align:left; padding:.65rem .55rem; min-height:40px; font-size:.84rem; line-height:1.45; flex:1; cursor:pointer; }
.contents-row button:hover { color:var(--text); background:var(--surface-2); }
.contents-row button[aria-current] { color:var(--gold-bright); background:var(--gold-dim); border-left:2px solid var(--gold); }
.contents-row .pin { flex:0 0 32px; padding:.4rem; text-align:center; color:var(--faint); }
.group-title > button:first-child { color:var(--text); font-weight:650; }
.contents-group { border-top:1px solid var(--line); margin-top:.6rem; padding-top:.45rem; }
.child > button:first-child { padding-left:1rem; }
</style>
