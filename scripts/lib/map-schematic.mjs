/** Original SVG diagrams for verified logical connections, not geographical coordinates.
 * Nodes: {id,label,x,y,floor?}; edges: {from,to,kind?:path|teleport|drop,label?,evidence}.
 * x/y place the diagram only. Callers must verify and cite every relationship.
 */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const wrap = (text, limit = 24) => {
  const lines = ['']
  for (const word of String(text).split(/\s+/)) {
    const last = lines.length - 1
    if (lines[last] && `${lines[last]} ${word}`.length > limit) lines.push(word)
    else lines[last] += `${lines[last] ? ' ' : ''}${word}`
  }
  return lines
}
export function renderMapSchematic({ title, edition = '', nodes, edges, width = 1400, height = 980, subtitle = 'Regional connections · schematic, not to scale' }) {
  const byId = new Map(nodes.map(n => [n.id,n]))
  for (const edge of edges) {
    if (!byId.has(edge.from) || !byId.has(edge.to) || !edge.evidence) throw new Error(`Schematic edge lacks nodes or evidence: ${JSON.stringify(edge)}`)
  }
  const paths = edges.map(edge => {
    const a = byId.get(edge.from), b = byId.get(edge.to)
    const x1 = a.x*width, y1 = a.y*height, x2 = b.x*width, y2 = b.y*height
    const transport = edge.kind === 'teleport', directed = edge.kind === 'drop'
    const color = transport ? '#b2a0ef' : directed ? '#e9b06a' : '#6e96a5'
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy), ux=dx/len,uy=dy/len
    // Stop a one-way arrow outside the destination zone, keeping it visible.
    const endpoint = directed ? {x:x2-ux*126,y:y2-uy*85} : {x:x2,y:y2}
    return `<g><title>${esc(edge.label || edge.kind || 'Route')} — evidence: ${esc(edge.evidence)}</title><path d="M ${x1} ${y1} L ${endpoint.x} ${endpoint.y}" fill="none" stroke="${color}" stroke-width="4" ${transport?'stroke-dasharray="12 9"':''} ${directed?'marker-end="url(#arrow)"':''}/>${edge.label?`<g transform="translate(${(x1+x2)/2},${(y1+y2)/2-10})"><rect x="-${Math.min(155,edge.label.length*4.5+10)}" y="-14" width="${Math.min(310,edge.label.length*9+20)}" height="28" rx="8" fill="#0f1a24"/><text text-anchor="middle" fill="${color}" font-size="15">${esc(edge.label)}</text></g>`:''}</g>`
  }).join('\n')
  const rooms = nodes.map((node,index) => {
    const x=node.x*width,y=node.y*height,lines=wrap(node.label)
    const titleY = y - 24 - (lines.length-1)*10
    return `<g><title>${esc(node.label)}${node.floor?` — ${esc(node.floor)}`:''}</title><path d="M ${x-108} ${y-68} L ${x+92} ${y-68} Q ${x+122} ${y-68} ${x+122} ${y-38} L ${x+122} ${y+51} L ${x+103} ${y+69} L ${x-95} ${y+69} Q ${x-122} ${y+69} ${x-122} ${y+40} L ${x-122} ${y-52} Z" fill="#172938" stroke="#47616f" stroke-width="2"/><path d="M ${x-99} ${y-68} L ${x-43} ${y-68}" stroke="#e5ae68" stroke-width="4"/>${lines.map((line,i)=>`<text x="${x}" y="${titleY+i*22}" text-anchor="middle" fill="#f0eee7" font-size="20" font-weight="600">${esc(line)}</text>`).join('')}<text x="${x}" y="${y+13}" text-anchor="middle" fill="#96aeba" font-size="14">${esc(node.floor || 'Region')}</text><text x="${x-98}" y="${y+51}" fill="#5f7b89" font-size="13">${String(index+1).padStart(2,'0')}</text></g>`
  }).join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}: schematic, not to scale"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9Z" fill="#e9b06a"/></marker><pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".75" fill="#7996a5" opacity=".09"/></pattern></defs><rect width="100%" height="100%" fill="#0b141d"/><rect width="100%" height="100%" fill="url(#grain)"/><path d="M40 38H92" stroke="#e5ae68" stroke-width="5"/><text x="40" y="81" fill="#f3eee4" font-family="Arial,sans-serif" font-size="31" font-weight="700">${esc(title)}</text><text x="40" y="111" fill="#9fb1bc" font-family="Arial,sans-serif" font-size="17">${esc(edition)}${edition?' · ':''}${esc(subtitle)}</text><g font-family="Arial,sans-serif">${paths}${rooms}</g><path d="M40 ${height-76} H${width-40}" stroke="#263c4a"/><g font-family="Arial,sans-serif" font-size="15" fill="#a4b7c2"><text x="40" y="${height-47}">Solid line: route · Dashed line: transport · Arrow: one-way route</text><text x="40" y="${height-21}">Some rooms and connections are omitted. Follow marker directions; spacing and angles are diagrammatic.</text></g><text x="${width-40}" y="${height-47}" text-anchor="end" font-family="Arial,sans-serif" font-size="14" fill="#657f8e">Original CodWiki schematic</text></svg>\n`
}
