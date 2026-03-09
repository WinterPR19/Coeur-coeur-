import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cœur à Cœur 💕',
  description: 'Questionnaires d\'amour anonymes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}