import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import Feed from "@/components/Feed";
import Footer from "@/components/Footer";
import Actions from "@/components/Actions";


export default function Home() {
  return (
    <div
    className="mx-[140px] flex flex-col h-screen border border-black"
    >
    <TopNav />
    <Hero />
    <Actions />
    <Feed />
    <Footer />
    </div>
  );
}
