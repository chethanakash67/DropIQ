import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SectionReveal from "@/components/section-reveal"

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <SectionReveal className="flex-grow container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400">
            About DropIQ
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <p>
              DropIQ was born out of a simple observation: buying gadgets shouldn't be a gamble. As students and tech enthusiasts, we found ourselves constantly jumping between dozen of tabs, trying to figure out if we were actually getting a good deal or just falling for marketing hype.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">Our Mission</h2>
            <p>
              Our mission is to bring transparency to the e-commerce landscape. We believe every product has a true value, and our job is to help you find the marketplace that honors that value, without the hidden costs or inflated price tags.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">What We Do</h2>
            <p>
              We don't just compare prices; we analyze value. By bridging the gap between massive online marketplaces and local offline retailers, we provide a holistic view of the market. Our proprietary Value Score takes into account not just the price, but the features, reliability, and location-based availability of every product.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12">The Team</h2>
            <p>
              We are a team of students and engineers dedicated to building tools that empower consumers. DropIQ is our way of giving back to the community by making smart shopping accessible to everyone.
            </p>
          </div>
        </div>
      </SectionReveal>
      <Footer />
    </main>
  )
}
