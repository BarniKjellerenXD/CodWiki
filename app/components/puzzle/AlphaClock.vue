<script setup lang="ts">
const props=defineProps<{hour:number;minute:number;label?:string}>()
const point=(n:number,r:number)=>({x:60+Math.sin(n*Math.PI/180)*r,y:60-Math.cos(n*Math.PI/180)*r})
const hourHand=computed(()=>point((props.hour%12)*30+props.minute/2,27))
const minuteHand=computed(()=>point(props.minute*6,39))
</script>
<template>
  <svg viewBox="0 0 120 120" role="img" :aria-label="label || `${hour}:${String(minute).padStart(2,'0')}`" class="alpha-clock">
    <circle cx="60" cy="60" r="57" fill="#f1e5ca" stroke="#c19a57" stroke-width="3" />
    <g fill="#26231c" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-size="10" font-weight="700"><text v-for="n in 12" :key="n" :x="point(n*30,46).x" :y="point(n*30,46).y">{{n}}</text></g>
    <line x1="60" y1="60" :x2="hourHand.x" :y2="hourHand.y" stroke="#24221d" stroke-width="6" stroke-linecap="round" />
    <line x1="60" y1="60" :x2="minuteHand.x" :y2="minuteHand.y" stroke="#8b3e21" stroke-width="3" stroke-linecap="round" />
    <circle cx="60" cy="60" r="4" fill="#24221d" />
  </svg>
</template>
<style scoped>.alpha-clock{width:116px;height:116px;flex-shrink:0}</style>
