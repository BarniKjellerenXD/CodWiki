<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" @keydown="onKeydown" tabindex="0" ref="overlayRef">
    <div class="absolute inset-0" @click.self="close">
      <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" @click.stop="zoom(0.25)">+
        </button>
        <button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" @click.stop="zoom(-0.25)">-
        </button>
        <button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" @click.stop="reset">Reset
        </button>
        <a class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" :href="src" target="_blank" rel="noopener noreferrer" @click.stop>Open</a>
        <button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" @click.stop="close">Close</button>
      </div>

      <div
        class="absolute inset-0 overflow-hidden select-none z-0"
        ref="viewportRef"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <img
          ref="imgRef"
          :src="src"
          :alt="alt"
          class="max-w-none will-change-transform"
          :style="{
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }"
          draggable="false"
        />
      </div>

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/80 text-sm px-3 py-1.5 rounded-md bg-white/10 border border-white/20">
        Scroll to zoom • Drag to pan • Esc to close
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{ src: string; alt?: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const overlayRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

function close() {
  emit('close')
}

function reset() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function zoom(delta: number) {
  scale.value = clamp(scale.value + delta, 0.5, 6)
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  zoom(delta)
}

function onPointerDown(e: PointerEvent) {
  if (viewportRef.value) viewportRef.value.setPointerCapture(e.pointerId)
  isDragging.value = true
  lastX.value = e.clientX
  lastY.value = e.clientY
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - lastX.value
  const dy = e.clientY - lastY.value
  lastX.value = e.clientX
  lastY.value = e.clientY
  translateX.value += dx
  translateY.value += dy
}

function onPointerUp(e: PointerEvent) {
  isDragging.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') return close()
  if (e.key === '+') return zoom(0.25)
  if (e.key === '-') return zoom(-0.25)
  if (e.key === '0') return reset()
  if (e.key === 'ArrowLeft') translateX.value -= 20
  if (e.key === 'ArrowRight') translateX.value += 20
  if (e.key === 'ArrowUp') translateY.value -= 20
  if (e.key === 'ArrowDown') translateY.value += 20
}

onMounted(() => {
  overlayRef.value?.focus()
})

onUnmounted(() => {
})

watch(() => props.src, () => {
  reset()
})
</script>

<style scoped>
/* No additional scoped styles necessary */
</style>
