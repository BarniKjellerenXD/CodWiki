// Vendor a tiny licensed subset so map markers never depend on a CDN.
const fs = require('node:fs');
const path = require('node:path');
const packageRoot = process.argv[2];
if (!packageRoot) throw Error('Pass an installed lucide package directory');
const { icons } = require(packageRoot);
const names = ['Power','Zap','Sparkles','Wrench','Shield','CupSoda','Rabbit','Crosshair','Package','Boxes','Puzzle','Key','Music','Shovel','DoorOpen','Signpost','Orbit','LogOut','MapPin','Flag','Landmark','FileText','CircleHelp','Flame','Fish','Radio','Dog','Fuel','CircleDot','User','Bot','Gamepad2','Volume2'];
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const result = Object.fromEntries(names.map(name => {
  if (!icons[name]) throw Error('Missing icon '+name);
  return [name, icons[name].map(([tag,attrs])=>`<${tag} ${Object.entries(attrs).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}/>`).join('')];
}));
fs.writeFileSync('app/data/mapIcons.json', JSON.stringify(result,null,2)+'\n');
fs.mkdirSync('public/maps/licenses',{recursive:true});
fs.copyFileSync(path.join(packageRoot,'LICENSE'),'public/maps/licenses/lucide.txt');
console.log(`Vendored ${names.length} map icons and license notice.`);
