export const metadata = {
  title: 'Terms of Service - AdventureHub',
  description: 'Terms of Service for AdventureHub - Your Tabletop RPG Campaign Management Tool',
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500">Last Updated: February 13, 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using AdventureHub ("Service"), you agree to be bound by these Terms of Service. 
          If you disagree with any part of the terms, you do not have permission to access the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          AdventureHub is a web application for Dungeon Masters and players to create and manage their 
          tabletop roleplaying game campaigns. The Service includes features such as:
        </p>
        <ul>
          <li>Campaign management (sessions, notes, assets)</li>
          <li>Character creation and management</li>
          <li>AI-enhanced session summaries</li>
          <li>Collaborative tools and polls</li>
          <li>Asset management and storage</li>
        </ul>

        <h2>3. User Accounts</h2>
        <p>
          To access the Service, you must create an account using Discord, Google, or email authentication. 
          You are responsible for:
        </p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>

        <h2>4. Subscription and Payments</h2>
        <p>
          The Service offers different subscription tiers with varying features. By subscribing to a paid tier:
        </p>
        <ul>
          <li>You agree to pay all fees according to your selected plan</li>
          <li>Subscriptions automatically renew unless cancelled</li>
          <li>Refunds are handled according to our refund policy</li>
          <li>Feature access is determined by your subscription tier</li>
        </ul>

        <h2>5. User Content</h2>
        <p>
          When using our Service, you may create, upload, or share content ("User Content"). You retain 
          ownership of your User Content, but grant us a license to host and make it available according 
          to your selected sharing settings. You are responsible for:
        </p>
        <ul>
          <li>Ensuring you have the rights to share your content</li>
          <li>Content that doesn't violate any laws or rights</li>
          <li>Managing sharing permissions for your campaigns</li>
          <li>Backing up your important content</li>
        </ul>

        <h2>6. AI-Generated Content</h2>
        <p>
          Our Service uses AI technologies (OpenAI, Replicate, ElevenLabs) to enhance your experience. 
          Regarding AI-generated content:
        </p>
        <ul>
          <li>We do not guarantee the accuracy or appropriateness of AI-generated content</li>
          <li>You are responsible for reviewing and moderating AI-generated content</li>
          <li>Usage of AI features may be subject to rate limiting</li>
          <li>AI-generated content must comply with our content guidelines</li>
        </ul>

        <h2>7. Prohibited Uses</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal purposes</li>
          <li>Share inappropriate or harmful content</li>
          <li>Attempt to gain unauthorized access</li>
          <li>Interfere with the Service's functionality</li>
          <li>Resell or redistribute the Service</li>
        </ul>

        <h2>8. Intellectual Property</h2>
        <p>
          The Service, including its original content, features, and functionality, is owned by 
          AdventureHub and protected by international copyright, trademark, and other intellectual 
          property laws.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior 
          notice or liability, for any reason, including breach of these Terms. Upon termination:
        </p>
        <ul>
          <li>Your right to use the Service will immediately cease</li>
          <li>You may request a copy of your data within 30 days</li>
          <li>We may retain your data as required by law</li>
        </ul>

        <h2>10. Limitation of Liability</h2>
        <p>
          AdventureHub and its suppliers shall not be liable for any indirect, incidental, special, 
          consequential, or punitive damages resulting from your use or inability to use the Service.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify users of any material 
          changes via email and/or a prominent notice on our Service.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:{' '}
          <a href="mailto:flipsuk@gmail.com" className="text-primary hover:underline">
            flipsuk@gmail.com
          </a>
        </p>

        <hr className="my-8" />
        
        <p className="text-sm text-gray-500">
          These terms of service are effective as of February 13, 2025 and will remain in effect except 
          with respect to any changes in its provisions in the future, which will be in effect 
          immediately after being posted on this page.
        </p>
      </div>
    </div>
  )
} 