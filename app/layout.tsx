import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wing Shack Food Cost Calculator',
  description: 'Live GP calculations with Google Sheets integration for Wing Shack menu items.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}