import TopNav from "@/components/TopNav";
import Hero from "@/components/DashboardHero";
import Footer from "@/components/Footer";
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UserActions from "@/components/UserActions"


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
    <UserActions user={data.user} />
    <Footer />
    </div>
  );
}
