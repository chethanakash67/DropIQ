import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SectionReveal from "@/components/section-reveal"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <SectionReveal className="flex-grow container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <p className="text-sm italic">Last updated: April 26, 2026</p>
            
            <p>
              At DropIQ, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our website and services.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, search for products, or contact us for support. This may include your name, email address, and location data to provide local store comparisons.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing personalized product comparisons and Value Scores.</li>
              <li>Identifying offline stores near your location.</li>
              <li>Sending price-drop alerts and updates.</li>
              <li>Analyzing usage patterns to enhance user experience.</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">4. Your Choices</h2>
            <p>
              You can access, update, or delete your account information at any time through your dashboard settings. You may also opt-out of location tracking, though this will disable local store comparisons.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@dropiq.com.
            </p>
          </div>
        </div>
      </SectionReveal>
      <Footer />
    </main>
  )
}
