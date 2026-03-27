import Image from 'next/image'
import Link from 'next/link'

import {NAV_LINKS} from '@/app/lib/navigation'

export default function Header() {
  return (
    <header className="fixed z-50 h-24 inset-x-0 top-0 bg-white/95 flex items-center backdrop-blur-sm border-b border-gray-200">
      <div className="container py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Flour & Fiction"
              width={259}
              height={37}
              className="h-8 sm:h-9 w-auto"
              priority
            />
          </Link>

          <nav>
            <ul
              role="list"
              className="flex items-center gap-4 md:gap-6 text-xs sm:text-sm tracking-wide uppercase"
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-black hover:text-crimson transition-colors border-b-2 border-transparent hover:border-crimson pb-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
