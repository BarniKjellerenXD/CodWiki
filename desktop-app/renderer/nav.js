// Shared navigation table: used by main.js (shortcuts) and the sidebar renderer.
// Every item has a stable `id` used by settings (order / hidden / labels / shortcuts).
// `accel` is the DEFAULT shortcut — user remaps live via the settings page.
const NAV = [
  // ---- guides ----
  { id: 'rex-infernus', section: 'Guides', label: 'Rex Infernus', icon: '🐉', url: '/guides/rex-infernus', thumb: '/images/rex-infernus-thumb.jpg', accel: 'Ctrl+1' },
  { id: 'ashes-of-the-damned', section: 'Guides', label: 'Ashes of the Damned', icon: '🔥', url: '/guides/ashes-of-the-damned', thumb: '/images/ashes-thumb.jpg', accel: 'Ctrl+2' },
  { id: 'astra-malorum', section: 'Guides', label: 'Astra Malorum', icon: '🔭', url: '/guides/astra-malorum', thumb: '/images/astra-thumb.jpg', accel: 'Ctrl+3' },
  { id: 'paradox-junction', section: 'Guides', label: 'Paradox Junction', icon: '🌀', url: '/guides/paradox-junction', thumb: '/images/paradox-thumb.jpg', accel: 'Ctrl+4' },
  { id: 'totenreich', section: 'Guides', label: 'Totenreich', icon: '💀', url: '/guides/totenreich', thumb: '/images/totenreich-thumb.jpg', accel: 'Ctrl+5' },
  { id: 'kowakujo', section: 'Guides', label: 'Kowakujō', icon: '⛩️', url: '/guides/kowakujo', thumb: '/images/kowakujo-thumb.jpg', accel: 'Ctrl+6' },
  // ---- tools: kowakujo ----
  { id: 'kowakujo-pestle', section: 'Kowakujō', label: 'Pestle Scroll Solver', icon: '📜', url: '/tools/kowakujo-pestle-solver.html', accel: 'Ctrl+7' },
  { id: 'kowakujo-clock', section: 'Kowakujō', label: 'Clock & Flags Solver', icon: '🕐', url: '/tools/kowakujo-clock-solver.html', accel: 'Ctrl+8' },
  { id: 'kowakujo-murder', section: 'Kowakujō', label: 'Murder Mystery Solver', icon: '🗡️', url: '/tools/kowakujo-murder-solver.html', accel: 'Ctrl+Shift+1' },
  // ---- tools: rex infernus ----
  { id: 'rex-ring', section: 'Rex Infernus', label: 'Temple Ring Solver', icon: '🔄', url: '/tools/rex-infernus-ring-solver.html', accel: 'Ctrl+9' },
  { id: 'rex-pillars', section: 'Rex Infernus', label: 'Pillars & Levers', icon: '🏛️', url: '/tools/rex-infernus-pillars.html', accel: 'Ctrl+Shift+2' },
  { id: 'rex-house-symbols', section: 'Rex Infernus', label: 'House Symbols Tracker', icon: '🏠', url: '/tools/rex-infernus-house-symbols.html', accel: 'Ctrl+Shift+3' },
  // ---- tools: totenreich ----
  { id: 'totenreich-uranium', section: 'Totenreich', label: 'Uranium Pincers Solver', icon: '☢️', url: '/tools/totenreich-uranium-pincers.html', accel: 'Ctrl+Shift+4' },
  { id: 'totenreich-wunderbarrage', section: 'Totenreich', label: 'Wunderbarrage Codes', icon: '📡', url: '/tools/totenreich-wunderbarrage.html', accel: 'Ctrl+Shift+5' },
  // ---- tools: ashes ----
  { id: 'ashes-rocket-launch', section: 'Ashes of the Damned', label: 'Rocket Launch Codes', icon: '🚀', url: '/tools/ashes-rocket-launch.html', accel: 'Ctrl+Shift+6' },
  { id: 'ashes-serum', section: 'Ashes of the Damned', label: 'Serum Ingredient Order', icon: '🧪', url: '/tools/ashes-serum.html', accel: 'Ctrl+Shift+7' },
  // ---- tools: astra ----
  { id: 'astra-mars-code', section: 'Astra Malorum', label: 'Mars Code', icon: '🪐', url: '/tools/astra-mars-code.html', accel: 'Ctrl+Shift+8' },
  { id: 'astra-organ', section: 'Astra Malorum', label: 'Harmonic Organ Order', icon: '🎹', url: '/tools/astra-harmonic-organ.html', accel: 'Ctrl+Shift+9' },
  { id: 'astra-planets', section: 'Astra Malorum', label: 'Planet Sheets Map', icon: '🧭', url: '/tools/astra-planet-sheets.html', accel: 'Ctrl+Shift+0' }
]

// System-wide actions (non-navigation), also remappable in settings.
const SYSTEM_ACTIONS = [
  { id: 'sys-settings', label: 'Open Settings', accel: 'Ctrl+,' },
  { id: 'sys-home', label: 'Go Home', accel: 'Ctrl+H' },
  { id: 'sys-reload', label: 'Reload Page', accel: 'F5' },
  { id: 'sys-back', label: 'Back', accel: 'Alt+ArrowLeft' },
  { id: 'sys-forward', label: 'Forward', accel: 'Alt+ArrowRight' },
  { id: 'sys-zoom-in', label: 'Zoom In', accel: 'Ctrl+=' },
  { id: 'sys-zoom-out', label: 'Zoom Out', accel: 'Ctrl+-' },
  { id: 'sys-zoom-reset', label: 'Zoom Reset', accel: 'Ctrl+0' },
  { id: 'sys-devtools', label: 'Toggle DevTools', accel: 'F12' }
]

if (typeof window !== 'undefined') {
  window.NAV = NAV
  window.SYSTEM_ACTIONS = SYSTEM_ACTIONS
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NAV
  module.exports.SYSTEM_ACTIONS = SYSTEM_ACTIONS
}
