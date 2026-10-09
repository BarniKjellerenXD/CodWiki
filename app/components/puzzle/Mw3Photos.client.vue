<script setup lang="ts">
import data from '~/data/maps/mw3-urzikstan.json'
import type { MapDataset } from '~/types/map'
import { decodeGuideHash, mapAnchor, mapTargetFromAnchor } from '~/utils/mapNavigation.mjs'
const route = useRoute()
const router = useRouter()
// The server cannot see fragments. Read the initial browser hash before the
// viewer restores a saved board, then follow subsequent router navigation.
const targetId = ref(mapTargetFromAnchor(decodeGuideHash(import.meta.client ? window.location.hash : route.hash)) || '')
watch(() => route.hash, hash => { targetId.value = mapTargetFromAnchor(decodeGuideHash(hash)) || '' })
function readBrowserHash() { targetId.value = mapTargetFromAnchor(decodeGuideHash(window.location.hash)) || '' }
onMounted(() => { readBrowserHash(); window.addEventListener('hashchange', readBrowserHash) })
onBeforeUnmount(() => window.removeEventListener('hashchange', readBrowserHash))
function select(id: string) { targetId.value = id; router.replace({ hash: id ? `#${mapAnchor(id)}` : '' }) }
function guide(anchor: string) { router.push(`/guides/mw3-urzikstan#${anchor}`) }
</script>

<template>
  <ClientOnly fallback-tag="p" fallback="Loading the photo finder and map…">
    <LazyInteractiveMap :data="data as MapDataset" :target-id="targetId" :photo-finder="true" @select="select" @guide="guide" />
  </ClientOnly>
</template>
