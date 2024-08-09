import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import Feed from "@/components/Feed";
import Footer from "@/components/Footer";
import Actions from "@/components/Actions";
import AppMenu from "@/components/AppMenu";

export default function Home() {
  return (
    <div
    className="mx-[140px] flex flex-col h-screen shadow-sm"
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
