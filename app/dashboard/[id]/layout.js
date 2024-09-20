import TopNav from "@/components/Dashboard/TopNav";
import Hero from "@/components/Dashboard/DashboardHero";
import AppMenu from "@/components/Dashboard/AppMenu";
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { ThemeProvider } from "@/components/themeprovider"

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



    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <div
        className="bg-black"
        >
            <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
                <TopNav campaigns={[campaign]}/>
                <Hero name={campaign.name} description={campaign.description} image={campaign.campaign_image} />
                <AppMenu params={params}/>
                {children}
            </div>
        </div>
        </ThemeProvider>
    );
}