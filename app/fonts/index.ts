import localFont from 'next/font/local';
import { Source_Code_Pro } from 'next/font/google'

export const primary = localFont({
  src: [
    {
      path: './radix-light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: './radix-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './radix-medium.woff2',
      weight: '500',
      style: 'normal'
    }
  ],
  variable: '--primary-font',
  display: 'swap'
})
 
export const mono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--mono-font',
  display: 'swap'
})
