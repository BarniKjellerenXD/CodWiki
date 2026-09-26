<script setup lang="ts">
const books=[['The Musica Universalis','The Black Veil','The Moon Directive'],['Ash and Bones','Echoes of Andromeda','The Unknowable Void'],['Pyramids of Cydonia','Silence at Singularity','Witchlight Codex']]
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('books')
const counts=computed(()=>books.map((group,i)=>group.filter((_,j)=>state.value.selected.includes(i*3+j)).length))
function toggle(id:number) {const selected=state.value.selected; change({selected:selected.includes(id)?selected.filter((n:number)=>n!==id):[...selected,id]})}
</script>
<template><div class="puzzle"><p>Select the book titles on the machine’s reading list. Match busts to the bookshelves beside them.</p><div class="p-grid"><div v-for="(group,i) in books" :key="i"><strong>Bust {{ i+1 }}</strong><div v-for="(book,j) in group" :key="book" style="margin:.3rem 0"><button :aria-pressed="state.selected.includes(i*3+j)" @click="toggle(i*3+j)">{{ book }}</button></div></div></div><div class="p-result" aria-live="polite"><span v-for="(count,i) in counts" :key="i">{{ i?' · ':'' }}<strong>Bust {{ i+1 }}: {{ count }}</strong>{{ count?' interactions':' (skip)' }}</span></div><p class="p-muted">Enter the counts promptly in bust order. Zero means no interaction.</p><PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" /></div></template>
