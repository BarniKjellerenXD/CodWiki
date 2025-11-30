<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
/* Optional font hook: drop a Pigpen cipher TTF at /public/fonts/pigpen-cipher.ttf */
@font-face {
  font-family: 'PigpenCipher';
  src: url('/fonts/pigpen-cipher.otf') format('opentype'),
       url('/fonts/pigpen-cipher.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>
