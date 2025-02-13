import LandingPageNav from "@/components/LandingPage/LandingPageNav"

export default function PrivacyPolicyLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
        <LandingPageNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 