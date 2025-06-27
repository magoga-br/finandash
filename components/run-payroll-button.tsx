"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { runPayroll } from "@/app/dashboard/payroll/actions"

interface Employee {
  id: string
  name: string
  salary: string
}

export function RunPayrollButton({ employees }: { employees: Employee[] }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRunPayroll = async () => {
    setLoading(true)
    try {
      await runPayroll(employees)
      alert("Payroll processed successfully!")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to process payroll.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleRunPayroll} disabled={loading || employees.length === 0}>
      {loading ? "Processing..." : "Run Monthly Payroll"}
    </Button>
  )
}
