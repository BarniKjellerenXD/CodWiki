<template>
  <dialog class="lightbox" aria-modal="true" :aria-label="alt || 'Image reference'" @keydown="onKeydown" @cancel.prevent="close" tabindex="-1" ref="overlayRef">
    <div class="lightbox-inner" @click.self="close">
      <div class="lightbox-toolbar">
        <button type="button" class="lb-btn" aria-label="Zoom in" @click="zoom(0.25)">+</button>
        <button type="button" class="lb-btn" aria-label="Zoom out" @click="zoom(-0.25)">-</button>
        <button type="button" class="lb-btn" @click="reset">Reset</button>
        <a class="lb-btn" :href="src" target="_blank" rel="noopener noreferrer">Open</a>
        <button type="button" class="lb-btn" @click="close">Close</button>
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
        <ReferenceCrop v-if="crop" class="lightbox-img lightbox-crop" :src="src" :crop="crop" :alt="alt" :style="{ transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`, cursor: isDragging ? 'grabbing' : 'grab' }" />
        <img v-else
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
  </dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { ReferenceCrop } from '~/types/map'

const props = defineProps<{ src: string; alt?: string; crop?: ReferenceCrop }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const overlayRef = ref<HTMLDialogElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)
let invokingElement: HTMLElement | null = null
let bodyOverflow = ''
let rootOverflow = ''

function close() {
  overlayRef.value?.close()
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
  if (e.key === 'Tab') {
    const controls = overlayRef.value?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')
    if (!controls?.length) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === overlayRef.value)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === overlayRef.value)) {
      e.preventDefault()
      first.focus()
    }
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    return close()
  }
  if (['+', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault()
  if (e.key === '+') return zoom(0.25)
  if (e.key === '-') return zoom(-0.25)
  if (e.key === '0') return reset()
  if (e.key === 'ArrowLeft') translateX.value -= 20
  if (e.key === 'ArrowRight') translateX.value += 20
  if (e.key === 'ArrowUp') translateY.value -= 20
  if (e.key === 'ArrowDown') translateY.value += 20
}

onMounted(() => {
  invokingElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  bodyOverflow = document.body.style.overflow
  rootOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  // Native modal top layer makes the rest of the document inert, including settings.
  overlayRef.value?.showModal()
  overlayRef.value?.focus()
})

onUnmounted(() => {
  document.body.style.overflow = bodyOverflow
  document.documentElement.style.overflow = rootOverflow
  if (invokingElement?.isConnected) invokingElement.focus({ preventScroll: true })
})

watch(() => props.src, () => {
  reset()
})
</script>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  z-index: 100;
  color: var(--text);
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

.lb-btn:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}

.lightbox-viewport {
  position: absolute;
  inset: 4.5rem 1rem;
  z-index: 10;
  overflow: hidden;
  user-select: none;
  display: grid;
  place-items: center;
  touch-action: none;
}

.lightbox-img {
  display: block;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
}
.lightbox-crop { width:min(720px,100%); height:100%; object-fit:contain; transform-origin:center; }

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
