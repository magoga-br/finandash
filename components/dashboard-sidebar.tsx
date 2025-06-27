"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Briefcase, BarChart2, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/contracts", label: "Contratos", icon: Briefcase },
  { href: "/dashboard/payroll", label: "Folha de Pagamento", icon: Users },
  { href: "/dashboard/reports", label: "Relatórios", icon: BarChart2 },
  { href: "/dashboard/account", label: "Minha Conta", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border p-4 hidden md:block">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname.startsWith(item.href) && item.href !== "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : pathname === "/dashboard" && item.href === "/dashboard"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
