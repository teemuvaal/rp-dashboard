'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InviteMember({ campaignId, generateShareLink, refreshShareLink }) {
  const [shareUrl, setShareUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateLink = async () => {
    setIsLoading(true)
    const result = await generateShareLink(campaignId)
    setIsLoading(false)
    if (result.success) {
      setShareUrl(result.shareUrl)
    } else {
      // Handle error
      console.error(result.error)
    }
  }

  const handleRefreshLink = async () => {
    setIsLoading(true)
    const result = await refreshShareLink(campaignId)
    setIsLoading(false)
    if (result.success) {
      setShareUrl(result.shareUrl)
    } else {
      // Handle error
      console.error(result.error)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Invite Members</h2>
      <div className="space-x-2">
        <Button onClick={handleGenerateLink} disabled={isLoading}>
          {shareUrl ? 'Regenerate' : 'Generate'} Share Link
        </Button>
        {shareUrl && (
          <Button onClick={handleRefreshLink} disabled={isLoading}>
            Refresh Share Link
          </Button>
        )}
      </div>
      {shareUrl && (
        <div className="mt-4">
          <p>Share this link to invite members:</p>
          <Input value={shareUrl} readOnly />
          <p className="text-sm text-gray-500 mt-2">
            Note: Refreshing the link will invalidate the previous link.
          </p>
        </div>
      )}
    </div>
  )
}