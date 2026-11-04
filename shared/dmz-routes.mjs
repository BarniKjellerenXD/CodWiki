// Routes drawn on the Hajin Tac-Map: the path a video takes across the map, stop by stop.
// Positions are official units, like the markers in shared/dmz-map.mjs, which names
// the place each stop is at. A route is traced by hand, so its line follows roads
// roughly, not to the metre. Every stop is also a point on the path.

export const ROUTES_CHECKED = '4 Nov 2026'

export const routeSources = {
  'youtube-vl3c8nrzicg': { label: 'The Hajin route video on YouTube', url: 'https://www.youtube.com/watch?v=vL3C8nRziCg', type: 'video' },
}

export const mapRoutes = [
  {
    id: 'route-delta-to-dbn',
    name: 'Compound Delta to DBN Headquarters',
    summary: 'A long loop from the south edge of the reactor: down the railway to Songdo Wharf, west through Wolves Stadium and the southern compounds, north through Cheonwang Peak Array to Compound Charlie, then east along the Cheongun Village road to NuriGO Mall, ending at DBN Headquarters. It passes five of the six compounds.',
    // How the line was made, shown on the route's card.
    traced: 'Traced from four marked-up Tac-Map screenshots of the route as a player remembered it from the video, then fitted to the map art. The video itself has not been checked against the line, and what the run does at each stop is not recorded here.',
    confidence: 'reported',
    sources: ['youtube-vl3c8nrzicg'],
    videos: [{ id: 'youtube-vl3c8nrzicg', why: 'The run this route follows' }],
    stops: [
      [2829, 2223], [2973, 2660], [2602, 2907], [2512, 2767], [2285, 2843], [2352, 2957], [2142, 3084], [1924, 2906], [1877, 2728],
      [2078, 2634], [1777, 2212], [1687, 2120], [2039, 2071], [2108, 2071], [2172, 2065], [2683, 2321], [2512, 2473],
    ],
    path: [
      [2829, 2223], [2832, 2284], [2852, 2318], [2852, 2411], [2833, 2527], [2872, 2565], [2932, 2567], [2947, 2587], [2934, 2615], [2931, 2641],
      [2948, 2660], [2973, 2660], [2949, 2712], [2932, 2818], [2908, 2863], [2895, 2866], [2838, 2846], [2790, 2843], [2736, 2855], [2674, 2880],
      [2643, 2843], [2620, 2843], [2576, 2887], [2602, 2907], [2584, 2894], [2573, 2901], [2528, 2878], [2445, 2802], [2486, 2757], [2496, 2756],
      [2512, 2767], [2496, 2756], [2451, 2751], [2423, 2776], [2380, 2767], [2336, 2769], [2297, 2807], [2285, 2843], [2284, 2863], [2327, 2907],
      [2337, 2942], [2352, 2957], [2252, 2995], [2199, 3047], [2142, 3084], [2001, 2983], [1924, 2906], [1911, 2883], [1917, 2867], [1879, 2750],
      [1877, 2728], [1924, 2715], [1978, 2686], [2053, 2657], [2078, 2634], [1993, 2525], [1896, 2420], [1805, 2291], [1777, 2212], [1687, 2120],
      [1703, 2104], [1728, 2100], [2039, 2071], [2058, 2064], [2089, 2064], [2108, 2071], [2172, 2065], [2196, 2059], [2266, 2068], [2333, 2094],
      [2521, 2129], [2619, 2161], [2648, 2190], [2662, 2217], [2665, 2241], [2654, 2260], [2654, 2286], [2683, 2321], [2660, 2330], [2512, 2473],
    ],
  },
]
