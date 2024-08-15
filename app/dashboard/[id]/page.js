import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Feed from "@/components/DashboardFeed";
import Footer from "@/components/Footer";
import Actions from "@/components/Actions";
import AppMenu from "@/components/AppMenu";
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'


export default async function Home() {
    const supabase = createClient()
  
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/login')
    }
  return (
    <div
    className="mx-[140px] flex flex-col h-screen shadow-lg bg-gray-50"
    >
    <TopNav />
    <Hero />
    <AppMenu />
    <Actions />
    <Feed />
    <Footer />
    </div>
  );
}
