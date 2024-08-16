import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Footer from "@/components/Footer";
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UserActions from "@/components/UserActions"
import { fetchUserCampaigns } from './actions'
import CampaignList from "@/components/CampaignList"

export default async function Home() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/login')
    }

    const { campaigns, error: campaignsError } = await fetchUserCampaigns()

    return (
        <div className="mx-[140px] flex flex-col h-screen shadow-lg bg-gray-50">
            <TopNav />
            <Hero name={"Welcome to your Adventure Hub!"} description={"Here you can see and manage all your campaigns."} image={"/LandingPageHero.png"} />
            <UserActions user={data.user} />
            {campaignsError ? (
                <p>Error loading campaigns: {campaignsError}</p>
            ) : (
                <CampaignList campaigns={campaigns} />
            )}
            <Footer />
        </div>
    );
}