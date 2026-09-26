<template>
  <div class="lightbox" @keydown="onKeydown" tabindex="0" ref="overlayRef">
    <div class="lightbox-inner" @click.self="close">
      <div class="lightbox-toolbar">
        <button class="lb-btn" @click="zoom(0.25)">+</button>
        <button class="lb-btn" @click="zoom(-0.25)">-</button>
        <button class="lb-btn" @click="reset">Reset</button>
        <a class="lb-btn" :href="src" target="_blank" rel="noopener noreferrer">Open</a>
        <button class="lb-btn" @click="close">Close</button>
      </div>

      <div
        class="lightbox-viewport"
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
          class="lightbox-img"
          :style="{
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }"
          draggable="false"
        />
      </div>

      <div class="lightbox-hint">
        Scroll to zoom · Drag to pan · Esc to close
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
  // Focus overlay to receive keyboard events
  overlayRef.value?.focus()
})

onUnmounted(() => {
  // no global listeners to remove
})

watch(() => props.src, () => {
  reset()
})
</script>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(10, 8, 6, 0.88);
}

.lightbox-inner {
  position: absolute;
  inset: 0;
}

.lightbox-toolbar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.lb-btn:hover {
  background: var(--surface-3);
  border-color: var(--gold-border);
  color: var(--gold-bright);
}

.lightbox-viewport {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: hidden;
  select-none: none;
  touch-action: none;
}

.lightbox-img {
  display: block;
  margin: auto;
  max-width: none;
  will-change: transform;
}

.lightbox-hint {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.82rem;
  text-align: center;
}

.lightbox-inner::selection {
  background: transparent;
}
</style>
