import type { Metadata } from 'next';
import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';
import './globals.css';
export const metadata: Metadata = {
  title: 'RecruitFlow',
  description: 'RecruitFlow recruitment SaaS starter',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4"
        >
          Skip to content
        </a>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <BriefcaseBusiness className="text-indigo-600" />
              RecruitFlow
            </Link>
            <div className="flex gap-3 text-sm sm:gap-5">
              <Link href="/jobs">Jobs</Link>
              <Link href="/dashboard">Workspace</Link>
              <Link href="/login">Log in</Link>
            </div>
          </nav>
        </header>
        <main id="main-content" className="mx-auto max-w-6xl px-5 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
