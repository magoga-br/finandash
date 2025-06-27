"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { useTheme } from "./theme-provider"

interface Transaction {
  amount: string
  type: "income" | "expense"
  category: string
}

interface CategorySpendingReportProps {
  transactions: Transaction[]
}

const LIGHT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560", "#775DD0"]
const DARK_COLORS = ["#2272b6", "#1f9d82", "#d39c2c", "#d16a3e", "#922bc5", "#d14256", "#6651a9"]

export function CategorySpendingReport({ transactions }: CategorySpendingReportProps) {
  const { theme } = useTheme()
  const [colors, setColors] = useState(LIGHT_COLORS)

  useEffect(() => {
    setColors(theme === "dark" ? DARK_COLORS : LIGHT_COLORS)
  }, [theme])

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(Number.parseFloat(t.amount))
        return acc
      },
      {} as Record<string, number>,
    )

  const data = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No expense data available for this report.</p>
  }

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={150} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
