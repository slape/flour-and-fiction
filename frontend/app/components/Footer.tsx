import Link from 'next/link'

import {NAV_LINKS} from '@/app/lib/navigation'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container">
        <div className="flex flex-col items-center py-12 gap-6">
          <nav className="flex gap-6 text-sm text-gray-300">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              Flour &amp; Fiction may receive commissions for qualifying purchases made through
              affiliate links.
            </span>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors underline">
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <Link href="/refund" className="hover:text-white transition-colors underline">
              Refund Policy
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            &copy; Flour &amp; Fiction, {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
