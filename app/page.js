import Footer from "@/components/LandingPage/Footer";
import LandingPageNav from "@/components/LandingPage/LandingPageNav";
import LandingPageHero from "@/components/LandingPage/LandingPageHero";
import LandingPageCTA from "@/components/LandingPage/LandingPageCTA";
import LandingPageFeatures from "@/components/LandingPage/LandingPageFeatures";
import LandingPageFAQ from "@/components/LandingPage/LandingPageFAQ";
import LandingPageProblem from "@/components/LandingPage/LandingPageProblem";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col shadow-md bg-background"
    >
      <LandingPageNav />
      <div className="lg:mx-[140px] mx-4 flex-grow flex flex-col gap-4">
        <LandingPageHero />
        <Separator className="w-full my-4" />
        <LandingPageCTA />
        <Separator className="w-full my-4" />
        <LandingPageProblem />
        <Separator className="w-full my-4" />
        <LandingPageFeatures />
        <Separator className="w-full my-4" />
        <LandingPageFAQ />
      </div>
      <Footer />
    </div>
  );
}
 