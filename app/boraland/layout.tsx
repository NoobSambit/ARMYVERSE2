import { Orbitron, Inter } from 'next/font/google'

const orbitron = Orbitron({ 
  subsets: ['latin'], 
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

export default function BoraverseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      <div className={`${orbitron.variable} ${inter.variable} font-sans`}>
        {children}
      </div>
    </>
  )
}
