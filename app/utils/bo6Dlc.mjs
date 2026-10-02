export const protocolWords = ['CRAB', 'YETI', 'MOTH', 'WORM']
export const chalkboardPositions = ['Top left', 'Top middle', 'Top right', 'Bottom left', 'Bottom middle', 'Bottom right']
const result = (status, message, extra = {}) => ({ status, message, ...extra })

// Count the whole observed cluster, including the requested letter itself.
// Do not identify a board by an unlabeled corner: published shortcuts use different corners.
export function shatteredCipher(state = {}) {
  const word = String(state.word || '').toUpperCase()
  if (!protocolWords.includes(word)) return result('waiting', 'Choose the protocol printed by your fax machine.')
  const groups = chalkboardPositions.map((_, i) => String(state[`group-${i}`] || '').toUpperCase().replace(/\s/g, ''))
  if (groups.some(group => group && !/^[A-Z]{1,9}$/.test(group))) return result('invalid', 'Use letters only, with no more than nine letters in one cluster.')
  if (groups.some(group => new Set(group).size !== group.length)) return result('invalid', 'A letter appears twice in one cluster. Recheck the board before entering a code.')
  const all = groups.join('')
  if (new Set(all).size !== all.length) return result('invalid', 'A letter appears in more than one cluster. Recheck the duplicate letter.')
  const letters = [...word].map(letter => {
    const index = groups.findIndex(group => group.includes(letter))
    return { letter, index, group: groups[index] || '', digit: index < 0 ? null : groups[index].length }
  })
  const missing = [...new Set(letters.filter(row => row.digit === null).map(row => row.letter))]
  if (missing.length) return result('waiting', `Copy the complete clusters containing ${missing.join(', ')}.`, { letters })
  return result('ready', 'Enter this code at the Service Tunnel cell keypad.', { code: letters.map(row => row.digit).join(''), letters })
}

const symbols = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ')
export const periodicElements = symbols.map((symbol, index) => ({ symbol, number: index + 1 }))
export function reckoningElement(state = {}) {
  const count = state.screens
  if (!['One word', 'Two words'].includes(count)) return result('waiting', 'Confirm whether one or both monitors display a word this round.')
  const first = String(state.first || '').trim()
  const second = count === 'Two words' ? String(state.second || '').trim() : ''
  if (!first || (count === 'Two words' && !second)) return result('waiting', 'Record the Deadshot monitor first, then the family-tank monitor if active.')
  if (!/^[a-z]+$/i.test(first) || (second && !/^[a-z]+$/i.test(second))) return result('invalid', 'Enter the displayed word or its first letter using A–Z.')
  const symbol = first[0].toUpperCase() + (second[0]?.toLowerCase() || '')
  const element = periodicElements.find(row => row.symbol === symbol)
  if (!element) return result('invalid', `${symbol} is not an element symbol. Check monitor order and the current round.`, { symbol })
  return result('ready', 'Use the atomic number, padded to three digits, at the upstairs Bioweapons Lab keypad.', { ...element, code: String(element.number).padStart(3, '0') })
}

export const samFiles = [
  { id: 'badge', name: 'BND Badge', digit: '6', date: '1985-06-28', displayDate: '28 Jun 1985', location: 'Executive Suite coffee table, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-badge.jpeg' },
  { id: 'collar', name: 'Notso’s Collar', digit: '1', date: '1985-07-15', displayDate: '15 Jul 1985', location: 'Director’s Office coffee table, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-collar.jpeg' },
  { id: 'scarf', name: 'Scarf', digit: '3', date: '1985-08-21', displayDate: '21 Aug 1985', location: 'Director’s Office desk, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-scarf.jpeg' },
  { id: 'watch', name: 'Wristwatch', digit: '4', date: '1985-09-02', displayDate: '2 Sep 1985', location: 'Executive Suite table, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-watch.jpeg' },
  { id: 'goggles', name: 'Combat Goggles', digit: '5', date: '1985-10-12', displayDate: '12 Oct 1985', location: 'Director’s Office beside a lamp, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-goggles.jpeg' },
  { id: 'katana', name: 'Katana', digit: '2', date: '1985-12-08', displayDate: '8 Dec 1985', location: 'Executive Suite desk, or Teleportation Lab terminals', image: '/images/bo6-reckoning/file-katana.jpeg' }
]
export function reckoningFiles(state = {}) {
  const selected = samFiles.filter(row => state[row.id] === true)
  if (selected.length !== 4) return result(selected.length > 4 ? 'invalid' : 'waiting', `Select exactly the four files present in this match (${selected.length}/4 selected).`, { selected })
  return result('ready', 'Oldest to newest: enter the file numbers at the Teleportation Lab computer.', { selected, code: selected.map(row => row.digit).join('') })
}
