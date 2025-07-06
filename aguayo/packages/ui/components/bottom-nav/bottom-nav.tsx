'use client';

import { Home, LayoutGrid, LibraryBig, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: <Home className="h-6 w-6" />, label: 'Inicio' },
  { href: '/descubre', icon: <LayoutGrid className="h-6 w-6" />, label: 'Descubre' },
  { href: '/mi-biblioteca', icon: <LibraryBig className="h-6 w-6" />, label: 'Mi biblioteca' },
  { href: '/perfil', icon: <User className="h-6 w-6" />, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-background p-2 shadow-md lg:hidden">
      {navItems.map(({ href, icon, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center text-xs transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
