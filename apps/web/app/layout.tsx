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
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen grid grid-cols-[240px_1fr]">
            <aside className="border-r border-slate-800 p-4 bg-slate-950">
              <h1 className="font-bold text-cyan-400">ReefOps</h1>
              <p className="text-xs text-slate-400 mt-1">Enterprise reef operations</p>
              <nav className="mt-4 space-y-2 text-sm">
                {links.map(([label, href]) => (
                  <a key={href} href={href} className="block text-slate-200 hover:text-cyan-300">
                    {label}
                  </a>
                ))}
              </nav>
            </aside>
            <main className="p-6 bg-slate-950">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
