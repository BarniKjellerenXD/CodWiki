// Catalogue entries only. These editions deliberately have no quest checklist.
const entry = (gameId,slug,name,edition,mode='Survival') => ({id:`${gameId}-${slug}`,gameId,name,edition,mode,status:'planned',route:`/guides/${gameId}-${slug}`,group:'',image:'',interactiveMap:false})
export const plannedMaps = [
  entry('bo2','tranzit','TranZit','Green Run','TranZit'),
  entry('bo2','bus-depot','Bus Depot','Green Run survival area'),
  entry('bo2','town','Town','Green Run survival area','Survival / Grief'),
  entry('bo2','farm','Farm','Green Run survival area','Survival / Grief'),
  entry('bo2','diner','Diner','Green Run bonus mode','Turned'),
  entry('bo2','nuketown-zombies','Nuketown Zombies','Bonus map'),
  entry('bo2','die-rise','Die Rise','Revolution'),
  entry('bo2','mob-of-the-dead','Mob of the Dead','Uprising'),
  entry('bo2','cell-block','Cell Block','Mob of the Dead bonus area','Grief'),
  entry('bo2','buried','Buried','Vengeance'),
  entry('bo2','borough','Borough','Buried bonus area','Grief / Turned'),
  entry('bo2','origins','Origins','Apocalypse'),
  entry('bo1','kino-der-toten','Kino der Toten','Original Black Ops version'),
  entry('bo1','five','“Five”','Original Black Ops version'),
  entry('bo1','ascension','Ascension','First Strike'),
  entry('bo1','call-of-the-dead','Call of the Dead','Escalation'),
  entry('bo1','shangri-la','Shangri-La','Annihilation'),
  entry('bo1','moon','Moon','Rezurrection'),
  ...[['nacht-der-untoten','Nacht der Untoten'],['verruckt','Verrückt'],['shi-no-numa','Shi No Numa'],['der-riese','Der Riese']].map(([slug,name])=>entry('bo1',slug,name,'Black Ops remaster · Rezurrection')),
  entry('bo1','dead-ops-arcade','Dead Ops Arcade','Black Ops bonus mode','Arcade'),
  ...[['nacht-der-untoten','Nacht der Untoten'],['verruckt','Verrückt'],['shi-no-numa','Shi No Numa'],['der-riese','Der Riese']].map(([slug,name])=>entry('waw',slug,name,'Original World at War version'))
]
