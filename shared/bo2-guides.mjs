import {tranzitGuide,dieRiseGuide} from './bo2-victis.mjs'
import {mobGuide} from './bo2-mob.mjs'
import {buriedGuide} from './bo2-buried.mjs'
import {bo2OriginsGuide} from './bo2-origins.mjs'
import {survivalGuides} from './bo2-survival.mjs'
const all=[tranzitGuide,dieRiseGuide,mobGuide,buriedGuide,bo2OriginsGuide,...survivalGuides]
const order=['tranzit','bus-depot','town','farm','diner','nuketown-zombies','die-rise','mob-of-the-dead','cell-block','buried','borough','origins']
export const bo2Guides=order.map(slug=>all.find(g=>g.id===`bo2-${slug}`))
for(const g of bo2Guides){
 if(survivalGuides.some(map=>map.id===g.id))g.group='survival'
 if(g.sidePhases.length&&!g.sidePhases[0].group)g.sidePhases[0].group='Side Quests'
}
