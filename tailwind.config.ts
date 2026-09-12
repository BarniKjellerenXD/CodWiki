import type { Config } from 'tailwindcss'

/*
 * CodWiki palette remap — deployed site keeps the original cyan/fuchsia class
 * names in markup (from the very first template) but resolves them to the
 * gold/orange brand palette. Values extracted from the live entry CSS.
 * NO blue: the token names stay, the colors are gold/orange.
 */
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        cyan: {
          200: 'rgb(253 230 138 / <alpha-value>)', // amber-200
          300: '#fcd34d',                          // amber-300
          400: 'rgb(251 191 36 / <alpha-value>)',  // amber-400
          500: '#f59e0b',                          // amber-500 (gold accent)
        },
        fuchsia: {
          300: '#fdba74',                          // orange-300
          600: '#ea580c',                          // orange-600
        },
        slate: {
          900: 'rgb(10 10 12 / <alpha-value>)',    // near-black bg
        },
      },
    },
  },
}
