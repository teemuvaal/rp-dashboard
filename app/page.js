import Footer from "@/components/LandingPage/Footer";
import LandingPageNav from "@/components/LandingPage/LandingPageNav";
import LandingPageHero from "@/components/LandingPage/LandingPageHero";
import LandingPageCTA from "@/components/LandingPage/LandingPageCTA";
import LandingPageFeatures from "@/components/LandingPage/LandingPageFeatures";
import LandingPageFAQ from "@/components/LandingPage/LandingPageFAQ";
import LandingPageProblem from "@/components/LandingPage/LandingPageProblem";

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
        <LandingPageProblem />
        <LandingPageFeatures />
        <LandingPageFAQ />
      </div>
      <Footer />
    </div>
  );
}
