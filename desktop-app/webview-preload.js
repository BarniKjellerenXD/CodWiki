// This isolated preload only reports the document's reading theme to its host.
// It exposes no Electron or filesystem APIs to the website.
const { ipcRenderer } = require('electron')
const themes = new Set(['archive', 'midnight', 'forest', 'ember', 'paper'])
window.addEventListener('DOMContentLoaded', () => {
  const report = () => {
    const theme = document.documentElement.dataset.theme || 'archive'
    if (themes.has(theme)) ipcRenderer.sendToHost('cw-theme', theme)
  }
  report()
  new MutationObserver(report).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
