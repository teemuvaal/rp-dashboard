import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AcceptInvitePage({ params }) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    // Redirect to login page if user is not authenticated
    redirect('/login?next=/invite/' + params.token)
  }

  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: params.token,
    p_user_id: user.id
  })

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (data) {
    // Invitation accepted successfully
    redirect('/dashboard')
  } else {
    return <div>Invalid or expired invitation.</div>
  }
}