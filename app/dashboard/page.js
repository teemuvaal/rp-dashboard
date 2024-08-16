import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Footer from "@/components/Footer";
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UserActions from "@/components/UserActions"
import { fetchUserCampaigns } from './actions'
import CampaignList from "@/components/CampaignList"
import CreateCampaignForm from "@/components/CreateCampaignForm";

export default async function Home() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/login')
    }

    const { campaigns, error: campaignsError } = await fetchUserCampaigns()

    return (
        <div 
        style={{
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(185,164,121,1) 100%)"
          }}
        className="mx-[140px] flex flex-col h-screen shadow-lg bg-gray-50">
            <TopNav campaigns={campaigns}/>
            <Hero name={"Welcome to your Adventure Hub!"} description={"Here you can see and manage all your campaigns."} image={"/LandingPageHero.png"} />
            <section
            className="p-4 h-screen"
            >
            <UserActions user={data.user} />
            {campaignsError ? (
                <p>Error loading campaigns: {campaignsError}</p>
            ) : (
                <CampaignList campaigns={campaigns} />
            )}
            </section>
            <CreateCampaignForm />
            <Footer />
        </div>
    );
}