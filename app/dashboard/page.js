import TopNav from "@/components/Dashboard/TopNav";
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { fetchUserCampaigns } from './actions';
import CampaignList from "@/components/Dashboard/CampaignList";
import CreateCampaignForm from "@/components/Dashboard/CreateCampaignForm";
import AdminNav from "@/components/Dashboard/AdminNav";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings, CreditCard } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import SubscriptionStatus from "@/components/Dashboard/SubscriptionStatus";

export default async function Dashboard() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
        redirect('/login');
    }

    // Check if the user has a username set
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', data.user.id)
        .single();

    if (userError) {
        console.error('Error fetching user data:', userError);
    } else if (!userData?.username) {
        redirect('/dashboard/profile');
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', data.user.id);
    
    const isAdmin = userRole && userRole.length > 0 && userRole[0].role === 'admin';
    
    const { campaigns, error: campaignsError } = await fetchUserCampaigns();

    return (
        <div className="min-h-screen bg-background">
            <TopNav campaigns={campaigns} user={userData}/>
            
            <main className="container mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your campaigns and account settings
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/profile">
                                <Settings className="w-4 h-4 mr-2" />
                                Account Settings
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/subscription">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Subscription
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Campaigns Section - Takes up 3 columns */}
                    <div className="md:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                    <CardTitle>Campaigns</CardTitle>
                                    <CardDescription>
                                        Manage and access your active campaigns
                                    </CardDescription>
                                </div>
                                <CreateCampaignForm />
                            </CardHeader>
                            <CardContent>
                                {campaignsError ? (
                                    <div className="text-sm text-red-500">
                                        Error loading campaigns: {campaignsError}
                                    </div>
                                ) : (
                                    <CampaignList campaigns={campaigns} user={userData} />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Takes up 1 column */}
                    <div className="space-y-6">
                        {/* Account Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {userData?.profile_picture ? (
                                                <img
                                                    src={userData.profile_picture}
                                                    alt={userData.username}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-semibold">
                                                    {userData?.username?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{userData?.username}</p>
                                            <SubscriptionStatus />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <div className="text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span>Active Campaigns</span>
                                                <span className="font-medium">{campaigns?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Campaign Limit</span>
                                                <span className="font-medium">Unlimited!</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full justify-start" variant="ghost">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Campaign
                                </Button>
                                <Button className="w-full justify-start" variant="ghost" asChild>
                                    <Link href="/dashboard">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        <p className="text-muted-foreground">Upgrade Plan (coming soon!)</p>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        
                        {/* Admin Navigation - Only shown to admins */}
                        {isAdmin && <AdminNav />}
                    </div>
                </div>
            </main>
        </div>
    );
}