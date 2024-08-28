import Link from 'next/link';
import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Footer from "@/components/LandingPage/Footer";
import AppMenu from "@/components/AppMenu";
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CampaignLayout({ children, params }) {
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

    // Check if user is a member of the campaign
    const { data: membership, error: membershipError } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !membership) {
        redirect('/dashboard')
    }

    const menuItems = [
        { label: 'Feed', pathname: `/dashboard/${params.id}` },
        { label: 'Sessions', pathname: `/dashboard/${params.id}/sessions` },
        { label: 'Notes', pathname: `/dashboard/${params.id}/notes` },
        { label: 'Campaign', pathname: `/dashboard/${params.id}/details` },
    ]

    return (
        <div style={{
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(185,164,121,1) 100%)"
        }}>
            <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
                <TopNav campaigns={[campaign]}/>
                <Hero name={campaign.name} description={campaign.description} image="/LandingPageHero.png" />
                <AppMenu items={menuItems} />
                {children}
            </div>
        </div>
    );
}