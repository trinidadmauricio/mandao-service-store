/**
 * Componente Header Principal
 */

'use client';

import { Logo } from './logo';
import { Navigation } from './navigation';
import { SearchBar } from './search-bar';
import { CartIcon } from './cart-icon';
import { UserMenu } from './user-menu';
import { MobileMenu } from './mobile-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo y Menú Móvil */}
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Logo />
        </div>

        {/* Navegación Desktop */}
        <Navigation />

        {/* Barra de Búsqueda Desktop */}
        <div className="hidden lg:flex flex-1 justify-center">
          <SearchBar />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Barra de Búsqueda Móvil */}
          <div className="lg:hidden">
            <SearchBar variant="compact" />
          </div>
          <CartIcon />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

