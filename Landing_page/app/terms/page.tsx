import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SectionReveal from "@/components/section-reveal"

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <SectionReveal className="flex-grow container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <p className="text-sm italic">Last updated: April 26, 2026</p>
            
            <p>
              By accessing or using DropIQ, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">1. Use of Service</h2>
            <p>
              DropIQ provides a platform for comparing product prices and features. You agree to use the service only for lawful purposes and in accordance with these terms.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">2. Accuracy of Information</h2>
            <p>
              While we strive to provide the most accurate and up-to-date information, price and availability data from third-party stores can change rapidly. DropIQ is not responsible for any inaccuracies in the data provided by external online or offline retailers.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">4. Intellectual Property</h2>
            <p>
              The content, features, and functionality of DropIQ, including our proprietary Value Score algorithm, are owned by DropIQ and are protected by international copyright and trademark laws.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">5. Limitation of Liability</h2>
            <p>
              In no event shall DropIQ be liable for any indirect, incidental, or consequential damages arising out of your use of the service or the purchase of any products found through our platform.
            </p>
          </div>
        </div>
      </SectionReveal>
      <Footer />
    </main>
  )
}
