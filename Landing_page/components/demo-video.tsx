import SectionReveal from "./section-reveal"
import WaitlistForm from "./waitlist-form"

export default function DemoVideo() {
  return (
    <SectionReveal id="demo-video" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">{"See DropIQ in Action"}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-200">
          {"A quick look at searching, comparing, and choosing the best value."}
        </p>
      </div>
      
      {/* Video and CTA stacked */}
<div className="mt-8 flex flex-col items-center justify-center gap-8">
  {/* Video Section */}
  <div className="relative w-full max-w-3xl">
    <div className="rounded-[2.5rem] border border-gray-200 bg-white shadow-xl p-3 dark:bg-slate-900 dark:border-slate-800">
      <div className="rounded-[2rem] overflow-hidden border border-gray-100 bg-black dark:border-slate-800">
        <div className="aspect-[16/9]">
          <video
            src="/videos/dropiq_demo_vid.mp4"
            poster="/images/founders/dropiq_vid_thumbnail.jpeg"
            controls
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      {/* Speaker notch */}
      <div className="absolute left-1/2 top-1.5 -translate-x-1/2">
        <div className="h-1 w-16 rounded-full bg-gray-300 dark:bg-slate-700" />
      </div>
    </div>
  </div>

  {/* CTA Section */}
  <div className="flex flex-col items-center text-center max-w-md">
    <div className="space-y-4">
      <h3 className="text-xl sm:text-2xl font-semibold dark:text-white">
        {"Join the Waitlist"}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {"Be among the first to experience DropIQ and get exclusive early access perks."}
      </p>
      <WaitlistForm size="md" buttonText="Join the Waitlist Now" />
      <p className="text-xs text-gray-500 dark:text-gray-300">
        {"Early users get priority alerts and perks."}
      </p>
    </div>
  </div>
</div>
    </SectionReveal>
  )
}
