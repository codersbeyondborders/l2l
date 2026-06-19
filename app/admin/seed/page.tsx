'use client'

import { useEffect, useState } from 'react'

export default function SeedPage() {
  const [status, setStatus] = useState('Loading...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const seedCampaigns = async () => {
      try {
        setStatus('Seeding campaigns...')
        const res = await fetch('/api/seed-campaigns', {
          method: 'POST',
        })
        const data = await res.json()
        setStatus(JSON.stringify(data, null, 2))
      } catch (error) {
        setStatus(`Error: ${String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    seedCampaigns()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Campaign Seeding</h1>
      <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
        {status}
      </pre>
      {isLoading && <p className="mt-4 text-muted-foreground">Processing...</p>}
    </div>
  )
}
