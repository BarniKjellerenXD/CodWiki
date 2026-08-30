// Shared navigation table: used by main.js (shortcuts) and the sidebar renderer.
// Order matters: Ctrl+1..N maps to items 0..8.
const NAV = [
  { section: 'guides', label: 'Rex Infernus', icon: '🐉', url: '/guides/rex-infernus', thumb: '/images/rex-infernus-thumb.jpg' },
  { section: 'guides', label: 'Ashes of the Damned', icon: '🔥', url: '/guides/ashes-of-the-damned', thumb: '/images/ashes-thumb.jpg' },
  { section: 'guides', label: 'Astra Malorum', icon: '🔭', url: '/guides/astra-malorum', thumb: '/images/astra-thumb.jpg' },
  { section: 'guides', label: 'Paradox Junction', icon: '🌀', url: '/guides/paradox-junction', thumb: '/images/paradox-thumb.jpg' },
  { section: 'guides', label: 'Totenreich', icon: '💀', url: '/guides/totenreich', thumb: '/images/totenreich-thumb.jpg' },
  { section: 'guides', label: 'Kowakujō', icon: '⛩️', url: '/guides/kowakujo', thumb: '/images/kowakujo-thumb.jpg' },
  { section: 'tools', label: 'Pestle Scroll Solver', icon: '📜', url: '/tools/kowakujo-pestle-solver.html' },
  { section: 'tools', label: 'Clock & Flags Solver', icon: '🕐', url: '/tools/kowakujo-clock-solver.html' },
  { section: 'tools', label: 'Temple Ring Solver', icon: '🔄', url: '/tools/rex-infernus-ring-solver.html' }
]

if (typeof window !== 'undefined') window.NAV = NAV
if (typeof module !== 'undefined' && module.exports) module.exports = NAV
