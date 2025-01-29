'use client'

import { useEffect, useState } from 'react'
import { fetchAssets } from '@/app/dashboard/actions'
import Link from 'next/link'
import { FileText, Image, Link as LinkIcon, MoveRight } from 'lucide-react'
import { format } from 'date-fns'

const assetTypeIcons = {
  text: FileText,
  image: Image,
  link: LinkIcon,
}

export default function NavAssets({ campaignId }) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { assets: fetchedAssets } = await fetchAssets(campaignId)
        // Get 5 most recent assets
        const recentAssets = fetchedAssets
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
        setAssets(recentAssets)
      } catch (error) {
        console.error('Error loading assets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [campaignId])

  if (loading) {
    return (
      <div className="px-2 py-1.5">
        <span className="text-xs text-muted-foreground">Loading assets...</span>
      </div>
    )
  }

  return (
    <div className="py-1">
      {assets.map((asset) => {
        const Icon = assetTypeIcons[asset.type] || FileText
        return (
          <Link 
            key={asset.id} 
            href={`/dashboard/${campaignId}/assets/${asset.id}/edit`}
            className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
          >
            <Icon className="h-3 w-3 min-w-[12px]" />
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {asset.title}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {format(new Date(asset.created_at), 'MMM d')}
              </div>
            </div>
          </Link>
        )
      })}
      
      <Link 
        href={`/dashboard/${campaignId}/assets`}
        className="flex items-center w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md mt-1"
      >
        <span className="text-xs">View all assets</span>
        <MoveRight className="h-3 w-3 ml-auto" />
      </Link>
    </div>
  )
} 