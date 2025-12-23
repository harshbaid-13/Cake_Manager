'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/expenses", label: "Expenses" },
  { href: "/recipes", label: "Recipes" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-3 text-sm font-medium text-gray-600">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-3 py-1 ${active ? "text-emerald-600" : ""}`}
            >
              <span>{item.label}</span>
              {active ? <span className="mt-1 h-1 w-10 rounded-full bg-emerald-600" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


