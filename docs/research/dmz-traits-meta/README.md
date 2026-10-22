# DMZ traits and meta weapons: research (22 Oct 2026)

Working data for the visual trait tree, the Reddit trait tips and the Reddit meta weapon list. Not shipped to the site; the site's data lives in `shared/`.

| File | What it is | State |
|---|---|---|
| `structure.json` | The in-game trait tree layout, every trait with its tree, slot and effect, the rules, and conflicts with the current Intel data | Gathered and checked by a second agent against the saved pages |
| `weapon-facts.json` | The launch weapon list with classes and nicknames, DMZ balance notes, how to get each gun, and guide-site loadout lists for comparison | Gathered and checked |
| `reddit-threads-traits.json` | MW4-era Reddit threads found while researching traits: title, link, date, and whether their comments were read | Gathering stopped part way; tips not yet extracted |
| `reddit-threads-weapons.json` | The same for weapons and loadouts | Gathering stopped part way; meta not yet extracted |

Each item in the two checked files lists its source URLs. The `raw` fields name pages saved on the original computer, which are not in this repository.

## Reading Reddit

- The `.json` endpoints are blocked; RSS works with curl and a browser user agent, e.g. `https://www.reddit.com/r/DMZ/search.rss?q=trait&restrict_sr=1&sort=top&t=month&limit=100`, and a thread with its comments at `https://www.reddit.com/r/DMZ/comments/<post-id>/.rss?limit=500`.
- Wait about 12 s between requests and 90 s after a 429.
- Only posts from 2026-10-20 on count as play experience; older r/DMZ posts are about the MW2/MW3 DMZ.

## Rules for anything taken from here

No usernames or personal info, paraphrase instead of quoting, no rumours, leaks, datamines or exploit steps, and no PlayerAuctions.
