<script setup lang="ts">
// Opens an Intel entry in the DMZ shell's drawer: a link to #intel-<id> on this
// page that keeps its query. With anchor, the drawer brings this element into
// view when someone lands on the link from elsewhere.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ id: string, anchor?: boolean }>()
const route = useRoute()
const to = computed(() => ({ query: route.query, hash: `#intel-${props.id}` }))
</script>

<template>
  <!-- custom: these links share the page's path, so RouterLink would mark every one as the current page. -->
  <NuxtLink v-slot="{ href, navigate }" :to="to" custom>
    <a v-bind="$attrs" :href="href" :data-intel="anchor ? id : undefined" :class="{ 'is-open': route.hash === `#intel-${id}` }" @click="navigate"><slot /></a>
  </NuxtLink>
</template>
