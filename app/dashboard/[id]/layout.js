import TopNav from "@/components/Dashboard/TopNav";
import Hero from "@/components/Dashboard/DashboardHero";
import AppMenu from "@/components/Dashboard/AppMenu";
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


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

    const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single()

    // Check if user is a member of the campaign
    const { data: membership, error: membershipError } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_id', params.id)
        .eq('user_id', user.id)
        .single()

    const isOwner = membership?.role === 'owner'

    if (membershipError || !membership) {
        redirect('/dashboard')
    }

    return (
        <div className="bg-black">
            <div className="flex flex-col min-h-screen w-full bg-background">
                <SidebarProvider>
                    <AppSidebar userData={userData} campaign={campaign} isOwner={isOwner}/>
                    <main className="flex-1">
                        <SidebarTrigger />
                        <div className="px-2 lg:px-4">
                            <Hero name={campaign.name} description={campaign.description} image={campaign.campaign_image} />
                            <AppMenu params={params} isOwner={isOwner}/>
                            {children}
                        </div>
                    </main>
                </SidebarProvider>
            </div>
        </div>
    );
}