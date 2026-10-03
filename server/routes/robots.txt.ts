import { renderRobots } from '#shared/seo.mjs'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return renderRobots(useRuntimeConfig(event).public.siteUrl)
})
