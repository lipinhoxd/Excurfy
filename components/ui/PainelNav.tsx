"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Item = { href: string; label: string; icone: ReactNode; disponivel: boolean };

const svg = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// Rotas ainda não construídas aparecem desabilitadas.
const ITENS: Item[] = [
  { href: "/painel", label: "Painel", icone: svg("M3 11l9-8 9 8M5 10v10h14V10"), disponivel: true },
  { href: "/painel/excursoes", label: "Excursões", icone: svg("M4 19c4 0 3-8 8-8s4 4 8-6M4 19h.01M20 5h.01"), disponivel: true },
  { href: "/painel/passageiros", label: "Passageiros", icone: svg("M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.9"), disponivel: false },
  { href: "/painel/financeiro", label: "Financeiro", icone: svg("M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"), disponivel: false },
];

export function PainelNav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Navegação do painel">
      {ITENS.map((item) => {
        if (!item.disponivel) {
          return (
            <span key={item.href} className="nav__item" aria-disabled="true" title="Em breve">
              {item.icone}
              {item.label}
            </span>
          );
        }
        // "/painel" só fica ativo na própria página; as demais valem também para subpáginas.
        const ativo = item.href === "/painel" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className="nav__item" aria-current={ativo ? "page" : undefined}>
            {item.icone}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
