// The original chart stays unchanged. These viewports display its actual board photos.
export const redWormPhotoAtlas = {
  image: '/images/remaining/reddit-red-worm-chart.jpeg', width: 1440, height: 3440,
  credit: 'spaz33g; Call of Duty gameplay imagery',
  source: 'https://www.reddit.com/r/CODZombies/comments/18yl0fd/my_red_worm_usb_location_cheat_sheet_in_case/',
  reviewed: '2026-10-09', sha256: '075c973363aa901308915a49295a7a5cec37765abc8df24d32a41c3a96d2eccb',
  photos: [
    [1, 'usb-key-m2603', 'Kotovo Blocks', 'C1', 'Curved road beside a long building'],
    [2, 'usb-key-m2597', 'Popov Power', 'F3', 'Circular cooling towers'],
    [3, 'usb-key-m2596', 'Zlatyev Array hill', 'I2', 'Scattered buildings beside winding roads'],
    [4, 'usb-key-m2575', 'Al-Abboud Condos', 'C4', 'Rows of stepped buildings'],
    [5, 'usb-key-m2625', 'Nahr Bathhouse', 'F4', 'Round courtyard in a square roof'],
    [6, 'usb-key-m2599', 'Opal Palace loading area', 'G4', 'Small buildings on a diagonal road'],
    [7, 'usb-key-m2598', 'Opal Palace', 'F5', 'Domed palace and curving riverbank'],
    [8, 'usb-key-m2606', 'Hadiqa Farms', 'I5', 'Small buildings beside a curving road'],
    [9, 'usb-key-m2595', 'Zaravan City', 'D6', 'Long rectangular roof'],
    [10, 'usb-key-m2594', 'Shorok Opera House', 'F7', 'Symmetrical stepped building'],
    [11, 'usb-key-m2604', 'Community Center', 'D8', 'Large building with parallel wings'],
    [12, 'usb-key-m2605', 'Shahin Manor', 'H8', 'Island estate and waterfront dock'],
  ].map(([number, locationId, landmark, grid, shape]) => ({
    number, locationId, landmark, grid, shape,
    crop: { x: number % 2 ? 38 : 750, y: 264 + Math.floor((number - 1) / 2) * 300, width: 300, height: 262, sourceWidth: 1440, sourceHeight: 3440 },
  })),
}
export const mw3PhotoTools = [{
  id: 'mw3-red-worm-photos', map: 'mw3-urzikstan', name: 'Red Worm photo finder', kind: 'solver',
  widget: 'mw3-photos', version: 1, fields: [],
  help: 'Select the four photographs on your current clue board to locate their USB consoles on the map.',
}]
