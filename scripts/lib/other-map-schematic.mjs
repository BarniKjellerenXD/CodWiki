import {renderMapSchematic} from './map-schematic.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
// Explicit bends prevent a transport link from appearing to join an intervening region.
const bends={
 'aw-outbreak:chutes:incinerator':{labelAt:[.73,.71]},
 'aw-carrier:hangar:gun':{via:[[.79,.16],[.17,.16]],labelAt:[.49,.16]},
 'iw-shaolin-shuffle:roof:blue':{via:[[.65,.2],[.65,.61]],labelAt:[.65,.33]},
 'iw-shaolin-shuffle:heebie:subway':{via:[[.05,.2],[.05,.89],[.34,.89],[.34,.79]],labelAt:[.18,.89]},
 'vanguard-der-anfang:office:void':{via:[[.95,.28],[.95,.82]],labelAt:[.92,.47],label:'Void portal'},
 'vanguard-terra-maledicta:debris:dark':{via:[[.34,.32],[.34,.79]],labelAt:[.34,.49]},
 'vanguard-shi-no-numa:doctors:main':{via:[[.81,.43],[.62,.43]],labelAt:[.76,.43]},
};
export function renderOtherSchematic({id,title,edition,nodes,edges}){
 const width=1400,height=980,byId=new Map(nodes.map(n=>[n.id,n]));
 const routes=edges.map(edge=>{
  const style=bends[`${id}:${edge.from}:${edge.to}`]||{};
  const a=byId.get(edge.from),b=byId.get(edge.to);
  const points=[[a.x,a.y],...(style.via||[]),[b.x,b.y]].map(([x,y])=>[x*width,y*height]);
  const directed=edge.kind==='drop',transport=edge.kind==='teleport';
  const color=directed?'#e9b06a':transport?'#b2a0ef':'#6e96a5';
  if(directed){const end=points.at(-1),prev=points.at(-2),dx=end[0]-prev[0],dy=end[1]-prev[1],len=Math.hypot(dx,dy);points[points.length-1]=[end[0]-dx/len*126,end[1]-dy/len*85];}
  const label=style.label||edge.label;
  const at=style.labelAt||[(a.x+b.x)/2,(a.y+b.y)/2];
  const labelWidth=Math.min(310,(label?.length||0)*9+20);
  return `<g><title>${esc(label||'Route')} — ${esc(edge.source||edge.evidence)}</title><path d="${points.map(([x,y],i)=>`${i?'L':'M'} ${x} ${y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="4" ${transport?'stroke-dasharray="12 9"':''} ${directed?'marker-end="url(#arrow)"':''}/>${label?`<g transform="translate(${at[0]*width},${at[1]*height-10})"><rect x="${-labelWidth/2}" y="-14" width="${labelWidth}" height="28" rx="8" fill="#0f1a24"/><text text-anchor="middle" fill="${color}" font-size="15">${esc(label)}</text></g>`:''}</g>`;
 }).join('');
 return renderMapSchematic({title,edition,nodes,edges:[]}).replace('<g font-family="Arial,sans-serif">',`<g font-family="Arial,sans-serif">${routes}`);
}
