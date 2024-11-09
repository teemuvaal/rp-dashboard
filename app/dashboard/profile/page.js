import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/Dashboard/ProfileForm'
import { updateProfile } from '../actions'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Error fetching profile:', profileError)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-2 p-4">
            <div className="flex flex-row gap-2">
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <ProfileForm 
                initialUsername={profile?.username || ''}
                initialProfilePicture={profile?.profile_picture || ''}
                updateProfile={updateProfile}
            />
        </div>
    )
}