import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background">{children}</main>
      </div>
    </div>
  )
}
