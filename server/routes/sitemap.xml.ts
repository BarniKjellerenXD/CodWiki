import catalogue from '#shared/catalogue.json'
import { renderSitemap } from '#shared/seo.mjs'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return renderSitemap(catalogue, useRuntimeConfig(event).public.siteUrl)
})
