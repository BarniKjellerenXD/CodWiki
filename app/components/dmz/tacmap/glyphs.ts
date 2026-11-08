// 24px stroke glyphs for the Hajin Tac-Map, one per layer.
export const GLYPHS: Record<string, string> = {
  poi: 'M12 3l9 9l-9 9l-9-9z',
  fortress: 'M4 21V7h3v3h3V7h4v3h3V7h3v14zM10 21v-5h4v5',
  area: 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  compound: 'M5 5h14v14H5zM9 9h6v6H9z',
  police: 'M12 3l7 3v5c0 4.5-3 8-7 10c-4-2-7-5.5-7-10V6z',
  clinic: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  fire: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.8 2.2-4.8c0 2 .8 3.3 2 3.8c-.4-3.4.3-6 .8-9z',
  gas: 'M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M3.5 21h12M5 10h9M14 9l3 3v5.5a1.5 1.5 0 0 0 3 0V9l-3-3',
  'marine-gas': 'M12 8v13M8 12h8M5 15a7 7 0 0 0 14 0M10 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  ammo: 'M4 9h16v11H4zM4 9l2-4h12l2 4M9 13h6',
  uav: 'M12 11v10M9 21l3-10l3 10M8.5 7.5a5 5 0 0 1 7 0M5.5 4.5a9 9 0 0 1 13 0',
  'lt-tower': 'M8 21l2-11h4l2 11M7 10h10M9 10V6h6v4M12 3v3M9.5 16h5',
  'key-room': 'M3.5 15.5a4 4 0 1 0 8 0a4 4 0 1 0-8 0M10.5 12.5L20 3M16 7l3 3M13.5 9.5l2 2',
  boss: 'M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.3 3 5.5V21h10v-4.5c1.8-1.2 3-3 3-5.5a8 8 0 0 0-8-8zM8 11.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13 11.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M10.5 21v-2.5M13.5 21v-2.5',
  exfil: 'M12 21V9M7 14l5-5l5 5M4 4h16',
  sam: 'M12 3l3 5v8l2 3v2l-5-2l-5 2v-2l2-3V8z',
  loot: 'M9 3h6l-2 4h-2zM11 7c-4 1.5-6.5 5-6.5 8.5A5.5 5.5 0 0 0 10 21h4a5.5 5.5 0 0 0 5.5-5.5C19.5 12 17 8.5 13 7',
  'mission-exit': 'M5 21V4M5 4h12l-2.5 4l2.5 4H5',
  bounty: 'M12 3v4M12 17v4M3 12h4M17 12h4M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  station: 'M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 11h14M8 21l2-4M16 21l-2-4',
  landmark: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM10 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  route: 'M5 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M15 4a2 2 0 1 0 4 0a2 2 0 1 0-4 0M9 18h6.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H15',
  mission: 'M9 4h6v3H9zM7 5.5H6V21h12V5.5h-1M9 13l2 2l4-4',
  'supply-drop': 'M4 10a8 8 0 0 1 16 0M4 10l8 5l8-5M12 15v2M8 17h8v4H8z',
  x01: 'M4 20h16M6 20V9l6-5l6 5v11M10 20v-6h4v6M12 4v-1',
  op: 'M12 3l2.6 5.6l6.1.7l-4.5 4.2l1.2 6l-5.4-3l-5.4 3l1.2-6L3.3 9.3l6.1-.7z',
  // Not layers: intel and the key tracker's held mark.
  intel: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7',
  held: 'M5 12l4 4l10-10',
}
export const svg = (layer: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${GLYPHS[layer] || GLYPHS.landmark}"/></svg>`

// Each layer's colour on the map, in rows and on chips. Reported sites share the
// DMZ gold, except loot, which keeps a colour clear of the gold and the threat ramp.
const REPORT = 'var(--dz-accent)'
export const LAYER_COLOR: Record<string, string> = {
  poi: 'var(--dz-ink)', fortress: 'var(--dz-ink)', area: 'var(--dz-ink)', compound: '#b9c77e',
  police: '#93bdf0', clinic: '#a9d98a', fire: '#f08b6c', gas: '#d8c47c', 'marine-gas': '#8fd3e3', ammo: '#cdbb98', uav: '#9fd8cf', 'lt-tower': '#e8a04f',
  'key-room': REPORT, boss: REPORT, exfil: REPORT, sam: REPORT, 'mission-exit': REPORT, bounty: REPORT, station: REPORT, landmark: REPORT,
  loot: '#d79cff', route: '#ff7ac6', mission: '#f7f5ea', op: '#f0a35e', 'supply-drop': '#c7d98a', x01: '#ff7a8a',
}
export const layerColor = (id: string) => LAYER_COLOR[id] || REPORT
