// Quick audit: find classes used in tool page templates that have no CSS rule
// in the page itself or in ToolShell.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const shellCss = readFileSync('app/components/ToolShell.vue', 'utf8')
for (const f of readdirSync('app/pages/tools')) {
  const src = readFileSync(join('app/pages/tools', f), 'utf8')
  const tmpl = src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
  const classes = new Set()
  for (const m of tmpl.matchAll(/class="([^"]+)"/g)) {
    m[1].split(/\s+/).forEach(c => {
      c = c.replace(/[:{'"].*/, '')
      if (c && !c.includes('$') && !c.includes('(')) classes.add(c)
    })
  }
  const allCss = shellCss + src
  const missing = [...classes].filter(c => !allCss.includes('.' + c))
  if (missing.length) console.log(f, '-> no CSS rule for:', missing.join(', '))
}
console.log('scan done')
