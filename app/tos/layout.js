import LandingPageNav from "@/components/LandingPage/LandingPageNav"

export default function TOSLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingPageNav className="mb-8"/>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 