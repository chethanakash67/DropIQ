import SectionReveal from "./section-reveal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Faq() {
  return (
    <SectionReveal id="faq" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">{"Frequently Asked Questions"}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-200 italic">{"\"Everything you need to know about DropIQ.\""}</p>
      </div>
      <div className="mt-8 max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl">{"How does the Value Score work?"}</AccordionTrigger>
            <AccordionContent>
              {"We combine price, key features, and reviews into a single score so you can quickly pick the best deal."}
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-2">
            <AccordionTrigger>{"Which stores do you compare?"}</AccordionTrigger>
            <AccordionContent>
              {"We compare top online retailers and are expanding to offline stores soon for local deals."}
            </AccordionContent>
          </AccordionItem> */}
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-xl">{"Is there a student discount?"}</AccordionTrigger>
            <AccordionContent>
              {"Yes. Early student signups get Pro at 50% off for life (limited to the first 500)."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-xl">{"When will DropIQ launch?"}</AccordionTrigger>
            <AccordionContent>
              {"We're launching soon. Join the waitlist to be notified and get early access perks."}
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-5">
            <AccordionTrigger>{"Do you favor any particular store?"}</AccordionTrigger>
            <AccordionContent>
              {"No. We stay store-agnostic to minimize bias and surface the best value for you."}
            </AccordionContent>
          </AccordionItem> */}
          {/* <AccordionItem value="item-6">
            <AccordionTrigger>{"Can I customize which features matter most?"}</AccordionTrigger>
            <AccordionContent>
              {"We're adding feature weighting controls so you can prioritize battery life, camera, storage, and more."}
            </AccordionContent>
          </AccordionItem> */}
          <AccordionItem value="item-7">
            <AccordionTrigger className="text-xl">{"Will you support local (offline) stores?"}</AccordionTrigger>
            <AccordionContent>
              {"Yes, offline stores are coming soon so you can compare nearby deals alongside online prices."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger className="text-xl">{"How do alerts work?"}</AccordionTrigger>
            <AccordionContent>
              {"Set alerts for specific gadgets or budgets. We'll notify you when a better value appears."}
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-9">
            <AccordionTrigger>{"Is my email safe?"}</AccordionTrigger>
            <AccordionContent>
              {"We only use your email for updates about DropIQ. You can unsubscribe anytime."}
            </AccordionContent>
          </AccordionItem> */}
          <AccordionItem value="item-10">
            <AccordionTrigger className="text-xl">{"Can I try Pro features during beta?"}</AccordionTrigger>
            <AccordionContent>
              {"Early users get access to upcoming Pro features and perks as we roll them out."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SectionReveal>
  )
}
