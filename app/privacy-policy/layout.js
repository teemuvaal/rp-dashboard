import NavMain from '@/components/nav-main'

export default function PrivacyPolicyLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavMain />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 