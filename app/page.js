import Footer from "@/components/Footer";
import LandingPageNav from "@/components/LandingPageNav";
import LandingPageHero from "@/components/LandingPageHero";
import LandingPageCTA from "@/components/LandingPageCTA";
import LandingPageFeatures from "@/components/LandingPageFeatures";

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col shadow-md"
      style={{
        background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(185,164,121,1) 100%)"
      }}
    >
      <LandingPageNav />
      <div className="lg:mx-[140px] mx-4 flex-grow flex flex-col">

        <LandingPageHero />
        <LandingPageCTA />
        <LandingPageFeatures />
      </div>
      <Footer />
    </div>
  );
}
