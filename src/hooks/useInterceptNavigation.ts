"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

/**
 * Hook que intercepta automaticamente cliques em links Next.js
 * e mostra o overlay de loading durante a navegação
 */
export function useInterceptNavigation() {
  const { setLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      if (href === pathname) {
        return;
      }

      setLoading(true, "Carregando página...");
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname, setLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, setLoading]);
}

