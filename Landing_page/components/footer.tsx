import { Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import Logo from "./logo"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="sm:col-span-2">
            <div className="inline-flex items-center gap-2">
              <Logo size="md" className="text-emerald-600 dark:text-cyan-400" />
              <span className="font-bold text-lg dark:text-white">{"DropiQ"}</span>
            </div>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-300 max-w-lg pr-4">
              {"We help students easily compare prices and features across the latest gadgets. Our goal is to ensure you always get the smartest deal without compromising on quality or performance."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold dark:text-white">{"Company"}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <Link className="hover:text-gray-900 dark:hover:text-cyan-300" href="#why-different">
                  {"About"}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900 dark:hover:text-cyan-300" href="#demo-video">
                  {"Contact"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold dark:text-white">{"Legal(Coming soon)"}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <a className="hover:text-gray-900 dark:hover:text-cyan-300 cursor-not-allowed" href="#" aria-disabled>
                  {"Privacy Policy"}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-900 dark:hover:text-cyan-300 cursor-not-allowed" href="#" aria-disabled>
                  {"Terms"}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              {/* <a
                href="#"
                aria-label="Twitter"
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-cyan-300"
              >
                <Twitter className="h-5 w-5" />
              </a> */}
              <a
                href="https://www.github.com/Sai-Videsh/dropiq"
                aria-label="GitHub"
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-cyan-300"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/dropiq25/"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-cyan-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center">
          {"© "} {new Date().getFullYear()} {" DropiQ. All rights reserved"}
          <a href="https://sovrn.co/1pw1jtx" className="text-gray-500 dark:text-gray-400">.</a>
        </div>
      </div>
    </footer>
  )
}
