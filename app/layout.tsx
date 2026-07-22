import type { Metadata } from 'next'
import { Playfair_Display, DM_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Famille Nguepi — Arbre Généalogique',
  description: 'Arbre généalogique de la famille Nguepi · Douanio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmMono.variable} ${sourceSerif.variable}`}>
      <body className="font-serif bg-parchment text-ink overflow-hidden h-screen">
        {children}
      </body>
    </html>
  )
}
