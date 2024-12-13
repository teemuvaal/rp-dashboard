import TopNav from "@/components/Dashboard/TopNav";
import Hero from "@/components/Dashboard/DashboardHero";
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UserActions from "@/components/Dashboard/UserActions"
import { fetchUserCampaigns } from './actions'
import CampaignList from "@/components/Dashboard/CampaignList"
import CreateCampaignForm from "@/components/Dashboard/CreateCampaignForm";

export default async function Home() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/login')
    }

    // Check if the user has a username set
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', data.user.id)
        .single()

    if (userError) {
        console.error('Error fetching user data:', userError)
    } else if (!userData?.username) {
        // Redirect to profile page if username is not set
        redirect('/dashboard/profile')
    }

    const { campaigns, error: campaignsError } = await fetchUserCampaigns()

    console.log(userData)
    return (
        <div 
        className="lg:mx-[140px] flex flex-col h-screen shadow-lg bg-background">
            <TopNav campaigns={campaigns} user={userData}/>
            <Hero name={"Welcome to your Adventure Hub!"} description={"Here you can see and manage all your campaigns."} image={"/LandingPageHero.png"} />
            <section
            className="p-4 h-screen"
            >
            <UserActions user={userData} />
            <div className="flex flex-row gap-4">
            <CreateCampaignForm />
            </div>
            {campaignsError ? (
                <p>Error loading campaigns: {campaignsError}</p>
            ) : (
                <CampaignList campaigns={campaigns} user={userData} />
            )}
            </section>
        </div>
    );
}