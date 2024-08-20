import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Feed from "@/components/DashboardFeed";
import Footer from "@/components/Footer";
import Actions from "@/components/Actions";
import AppMenu from "@/components/AppMenu";
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CampaignPage({ params }) {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
        redirect('/login')
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', params.id)
        .single()

    if (campaignError || !campaign) {
        notFound()
    }

    // Check if user is a member or owner of the campaign
    const { data: membership, error: membershipError } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !membership) {
        redirect('/dashboard')  // User is not a member, redirect to main dashboard
    }

    return (
        <div 
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(185,164,121,1) 100%)"
        }}
        className="lg:mx-[140px] flex flex-col h-screen shadow-lg bg-gray-50">
            <TopNav campaigns={campaign}/>
            <Hero name={campaign.name} description={campaign.description} />
            <AppMenu />
            <Actions />
            <Feed />
            <Footer />
        </div>
    );
}