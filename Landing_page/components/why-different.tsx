import SectionReveal from "./section-reveal"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from "lucide-react"

export default function WhyDifferent() {
  return (
    <SectionReveal id="why-different" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">{"Why We’re Different"}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-200">{"Feature-by-feature vs popular comparison sites."}</p>
      </div>
      <div className="mt-8 rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-900">
              <TableHead className="w-1/3 dark:text-gray-300">{"Feature"}</TableHead>
              <TableHead className="dark:text-gray-300">{"DropIQ"}</TableHead>
              <TableHead className="dark:text-gray-300">{"Smartprix"}</TableHead>
              <TableHead className="dark:text-gray-300">{"MySmartPrice"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { feature: "Value Score (price + features)", dropiq: true, s: false, m: false, unique: true },
              { feature: "Real-time price checks", dropiq: true, s: true, m: true, unique: false },
              { feature: "Feature-weighted comparisons", dropiq: true, s: false, m: false, unique: true },
              { feature: "Student-focused deals", dropiq: true, s: false, m: false, unique: true },
              { feature: "Store-agnostic (no ads bias)", dropiq: true, s: false, m: false, unique: true },
              { feature: "Priority price-drop alerts", dropiq: true, s: true, m: false, unique: false },
            ].map((row, i) => (
              <TableRow key={i} className="dark:hover:bg-slate-800/40">
                <TableCell className="font-medium dark:text-white">{row.feature}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    {row.dropiq ? (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-cyan-500" aria-hidden="true" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    )}
                    {row.unique && (
                      <Badge className="ml-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-cyan-900/30 dark:text-cyan-300">
                        {"Unique"}
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  {row.s ? (
                    <Check className="h-4 w-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 text-gray-300" aria-hidden="true" />
                  )}
                </TableCell>
                <TableCell>
                  {row.m ? (
                    <Check className="h-4 w-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 text-gray-300" aria-hidden="true" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionReveal>
  )
}
