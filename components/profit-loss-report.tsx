"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Transaction {
  amount: string
  type: "income" | "expense"
  category: string
}

interface ProfitLossReportProps {
  transactions: Transaction[]
}

export function ProfitLossReport({ transactions }: ProfitLossReportProps) {
  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number.parseFloat(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(Number.parseFloat(t.amount))
        return acc
      },
      {} as Record<string, number>,
    )

  const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0)
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Income</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(incomeByCategory).map(([category, amount]) => (
              <TableRow key={category}>
                <TableCell>{category}</TableCell>
                <TableCell className="text-right">${amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted">
              <TableCell>Total Income</TableCell>
              <TableCell className="text-right">${totalIncome.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Expenses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <TableRow key={category}>
                <TableCell>{category}</TableCell>
                <TableCell className="text-right">${amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted">
              <TableCell>Total Expenses</TableCell>
              <TableCell className="text-right">${totalExpenses.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center font-bold text-xl">
          <span>Net Profit</span>
          <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>${netProfit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
