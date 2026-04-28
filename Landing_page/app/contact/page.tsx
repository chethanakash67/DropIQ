import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SectionReveal from "@/components/section-reveal"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <SectionReveal className="flex-grow container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400">
            Contact Us
          </h1>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12">
            Have questions about DropIQ? We're here to help you get the smartest deals. Reach out to our team through any of the following channels.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-cyan-900/30">
                  <Mail className="h-6 w-6 text-emerald-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">support@dropiq.com</p>
                  <p className="text-gray-600 dark:text-gray-400">info@dropiq.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-cyan-900/30">
                  <MapPin className="h-6 w-6 text-emerald-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Office</h3>
                  <p className="text-gray-600 dark:text-gray-400">Innovator's Hub, MG Road</p>
                  <p className="text-gray-600 dark:text-gray-400">Bangalore, Karnataka, India</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-cyan-900/30">
                  <Phone className="h-6 w-6 text-emerald-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Send us a message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                  <input type="email" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Message</label>
                  <textarea className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 h-24" placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </SectionReveal>
      <Footer />
    </main>
  )
}
