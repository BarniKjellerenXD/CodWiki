// Viewports into the unmodified r/CODZombies reference sheet, not a translation table.
export const bloodSymbols = {
  '1': { view: '40 15 115 185', name: 'Arch with lower prongs' },
  '2': { view: '40 225 115 175', name: 'Inverted arch with centre stem' },
  '3': { view: '40 412 115 192', name: 'Arch with two upper circles' },
  '4': { view: '40 625 115 183', name: 'Double arch with two feet' },
  '5': { view: '40 825 115 179', name: 'Arch with three upper stems' },
  '6': { view: '40 1008 115 185', name: 'Cup with centre line' },
  A: { view: '530 30 180 188', name: 'Circle with vertical double arrow' },
  B: { view: '530 225 180 158', name: 'Circle with two diagonal lines' },
  C: { view: '530 400 180 185', name: 'Crossed arrows with small circle' },
  D: { view: '530 645 180 145', name: 'Arch with filled dot' },
  E: { view: '530 825 180 178', name: 'Two crossed diamonds' },
  F: { view: '530 1010 180 183', name: 'Stem over square with dot' }
}
export function powerHouseResult(state) {
  const rows = [0,1,2].map(i => ({ source: state[`source-${i}`] || '', target: state[`target-${i}`] || '', done: state[`done-${i}`] === true }))
  for (const key of ['source', 'target']) {
    const recorded = rows.map(row=>row[key]).filter(Boolean)
    if (new Set(recorded).size !== recorded.length) return { status:'invalid', message:`A ${key === 'source' ? 'steady-light' : 'replacement'} symbol is repeated. Recheck the observations.`, lines:[] }
  }
  if(rows.some(row=>!row.source || !row.target)) return {status:'waiting',message:'Record three steady-light symbols and their observed monitor replacements.',lines:[]}
  return {status:'ready',message:'Your observed lever symbols',lines:rows.map(row=>`${row.source} → ${row.target} — Spirit Blast at this lever`)}
}
