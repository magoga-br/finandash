"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "./theme-provider"

interface OverviewChartProps {
  userId: string
}

export function OverviewChart({ userId }: OverviewChartProps) {
  const [data, setData] = useState<any[]>([])
  const [chartColors, setChartColors] = useState({
    axis: "#888888",
    tooltip: "#000000",
    income: "#22c55e",
    expenses: "#ef4444",
  })
  const { theme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    // Update chart colors based on theme
    const newChartColors =
      theme === "dark"
        ? {
            axis: "hsl(var(--muted-foreground))",
            tooltip: "hsl(var(--background))",
            income: "hsl(var(--chart-2))",
            expenses: "hsl(var(--chart-5))",
          }
        : {
            axis: "hsl(var(--muted-foreground))",
            tooltip: "hsl(var(--foreground))",
            income: "#22c55e",
            expenses: "#ef4444",
          }
    setChartColors(newChartColors)
  }, [theme])

  useEffect(() => {
    async function fetchData() {
      const months = []
      const now = new Date()

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", userId)
          .gte("date", date.toISOString().split("T")[0])
          .lt("date", nextMonth.toISOString().split("T")[0])

        const income =
          transactions
            ?.filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number.parseFloat(t.amount.toString()), 0) || 0

        const expenses =
          transactions
            ?.filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount.toString())), 0) || 0

        months.push({
          name: date.toLocaleDateString("en-US", { month: "short" }),
          income,
          expenses,
        })
      }

      setData(months)
    }

    fetchData()
  }, [userId, supabase])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={chartColors.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          labelStyle={{ color: chartColors.tooltip }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
        />
        <Bar dataKey="income" fill={chartColors.income} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill={chartColors.expenses} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
