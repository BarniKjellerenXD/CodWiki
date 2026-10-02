import { guides as launch, tools as launchTools } from './bo6-launch.mjs'
import { guides as castleTomb, tools as castleTombTools } from './bo6-castle-tomb.mjs'
import { guides as dlc, tools as dlcTools } from './bo6-dlc.mjs'

// Release order is shared by site navigation, search and the desktop app.
const order = ['bo6-liberty-falls', 'bo6-terminus', 'bo6-citadelle-des-morts', 'bo6-the-tomb', 'bo6-shattered-veil', 'bo6-reckoning']
export const bo6Guides = [...launch, ...castleTomb, ...dlc].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
export const bo6Tools = [...launchTools, ...castleTombTools, ...dlcTools]
