export const metadata = {
  title: 'Privacy Policy - AdventureHub',
  description: 'Privacy Policy for AdventureHub - Your Tabletop RPG Campaign Management Tool',
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500">Last Updated: February 13, 2025</p>
        
        <h2>1. Introduction</h2>
        <p>
          Welcome to AdventureHub ("we," "our," or "us"). This Privacy Policy explains how we collect, 
          use, and protect your information when you use our tabletop RPG campaign management application.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Data</h3>
        <p>We collect the following personal information:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Payment information (processed securely through our payment processor)</li>
        </ul>

        <h3>2.2 Non-Personal Data</h3>
        <p>We use web cookies for:</p>
        <ul>
          <li>Authentication purposes</li>
          <li>Maintaining your session</li>
          <li>Improving your user experience</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information for:</p>
        <ul>
          <li>Managing your subscription</li>
          <li>Providing and maintaining our services</li>
          <li>Product analytics to improve our service</li>
          <li>Communicating important updates</li>
        </ul>

        <h2>4. Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your personal information. 
          Your data is stored securely and is only accessible to authorized personnel.
        </p>

        <h2>5. Data Sharing</h2>
        <p>
          We do not share, sell, rent, or trade your personal information with any external parties. 
          Your data is only used for providing and improving our services.
        </p>

        <h2>6. Children's Privacy</h2>
        <p>
          We do not knowingly collect or maintain information from persons under 13 years of age. 
          If we learn that personal information of persons under 13 has been collected on our service, 
          we will take appropriate steps to delete this information.
        </p>

        <h2>7. Updates to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by 
          sending an email to the address associated with your account and/or by placing a prominent 
          notice on our website.
        </p>

        <h2>8. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. You can also 
          request a copy of your data or ask questions about our privacy practices.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our practices, please contact us at:{' '}
          <a href="mailto:flipsuk@gmail.com" className="text-primary hover:underline">
            flipsuk@gmail.com
          </a>
        </p>

        <hr className="my-8" />
        
        <p className="text-sm text-gray-500">
          This privacy policy is effective as of February 13, 2025 and will remain in effect except 
          with respect to any changes in its provisions in the future, which will be in effect 
          immediately after being posted on this page.
        </p>
      </div>
    </div>
  )
} 