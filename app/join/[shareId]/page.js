import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { joinCampaign } from '@/app/dashboard/actions'

export default async function JoinCampaignPage({ params }) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    // Redirect to login page if user is not authenticated
    redirect('/login?next=/join/' + params.shareId)
  }

  const result = await joinCampaign(params.shareId, user.id)

  if (result.error) {
    return <div>Error: {result.error}</div>
  }

  if (result.success) {
    // Redirect to the campaign dashboard
    redirect(`/dashboard/${result.campaignId}`)
  }

  return <div>Processing your request...</div>
}