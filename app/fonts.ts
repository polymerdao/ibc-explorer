import { Wix_Madefor_Display, Source_Code_Pro, Montserrat } from 'next/font/google'

export const primary = Wix_Madefor_Display({
  subsets: ['latin'],
  variable: '--primary-font',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})
 
export const mono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--mono-font',
  display: 'swap',
})

export const accent = Montserrat({
  subsets: ['latin'],
  variable: '--secondary-font',
  display: 'swap',
})
