//aguayo/packages/ui/components/bottom-nav/bottom-nav.tsx
'use client';

import { Home, Search, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/discover', icon: Search, label: 'Buscar' },
  { href: '/my-services', icon: BookOpen, label: 'Servicios' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-white/20"></div>
      
      {/* Navigation content */}
      <nav className="relative z-10 flex justify-around items-center px-4 py-2 safe-area-pb">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-200 ${
                isActive 
                  ? 'text-primary scale-105' 
                  : 'text-neutral-500 hover:text-primary/70'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive ? 'animate-bounce-soft' : ''}`}>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/10 rounded-xl"></div>
                )}
                <Icon className={`relative w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              </div>
              <span 
                className={`text-xs mt-1 font-medium transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-neutral-500'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
