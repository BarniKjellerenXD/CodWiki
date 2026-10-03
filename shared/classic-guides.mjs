import {classicSurvivalGuides} from './classic-survival.mjs'
import {classicRemasterGuides} from './classic-remasters.mjs'
import {classicLaunchGuides} from './classic-launch.mjs'
import {callOfTheDeadGuide} from './classic-call-of-the-dead.mjs'
import {deadOpsGuide} from './classic-dead-ops.mjs'
import {classicLore} from './classic-lore.mjs'
import {originalCaption} from './classic-common.mjs'
export const classicGuides=[...classicSurvivalGuides,...classicLaunchGuides,...classicRemasterGuides,callOfTheDeadGuide,deadOpsGuide]
for(const guide of classicGuides){
 const lore=classicLore[guide.id]
 if(lore){guide.sidePhases.push(...lore.phases);guide.sources.push(...lore.sources)}
 if(guide.sidePhases.length)guide.sidePhases[0].group='Side Quests'
 for(const phase of [...guide.phases,...guide.sidePhases])for(const step of phase.steps)for(const image of step.images||[])image.alt=originalCaption(image.alt)
}
