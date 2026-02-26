import Link from 'next/link';
import { ReactNode } from 'react';
import { Providers } from '../components/providers';
import './globals.css';
import './globals.css';
import { ReactNode } from 'react';
import { Providers } from '../components/providers';

const links = [
  ['Dashboard', '/'],
  ['Tank Overview', '/tank-overview'],
  ['Water Tests', '/water-tests'],
  ['Livestock', '/livestock'],
  ['Tasks', '/tasks'],
  ['Notifications', '/notifications'],
  ['Organizations', '/organizations'],
  ['Analytics', '/analytics'],
] as const;
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_60%)] text-slate-100">
            <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
                <div>
                  <h1 className="text-lg font-bold text-cyan-400">ReefOps</h1>
                  <p className="text-xs text-slate-400">Production-grade aquarium operations platform</p>
                </div>
                <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Demo Mode Active</div>
                <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                  Demo Mode Active
                </div>
              </div>
            </header>

            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)]">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Navigation</p>
                <nav className="space-y-2 text-sm">
                  {links.map(([label, href]) => (
                    <Link
                    <a
                      key={href}
                      href={href}
                      className="block rounded-lg border border-transparent px-3 py-2 text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      {label}
                    </Link>
                    </a>
                  ))}
                </nav>
              </aside>

              <main className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
