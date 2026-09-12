// Legacy URL redirects: the old site served static .html files from /public.
// These now live as Vue routes without the extension.
const GUIDE_SLUGS = [
  'ashes-of-the-damned',
  'astra-malorum',
  'kowakujo',
  'paradox-junction',
  'rex-infernus',
  'totenreich',
]

const TOOL_SLUGS = [
  'ashes-rocket-launch',
  'ashes-serum',
  'astra-harmonic-organ',
  'astra-mars-code',
  'astra-planet-sheets',
  'kowakujo-clock-solver',
  'kowakujo-murder-solver',
  'kowakujo-pestle-solver',
  'rex-infernus-house-symbols',
  'rex-infernus-pillars',
  'rex-infernus-ring-solver',
  'totenreich-uranium-pincers',
  'totenreich-wunderbarrage',
]

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const match = path.match(/^\/(guides|tools)\/([\w-]+)\.html$/)
  if (match) {
    const [, dir, slug] = match
    const known = dir === 'guides' ? GUIDE_SLUGS.includes(slug) : TOOL_SLUGS.includes(slug)
    if (known) {
      return sendRedirect(event, `/${dir}/${slug}`, 301)
    }
  }
})