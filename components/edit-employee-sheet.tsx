"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertCircle } from "lucide-react"
import { updateEmployee } from "@/app/dashboard/payroll/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Employee {
  id: string
  name: string
  role: string | null
  salary: string
  hire_date: string
}

export function EditEmployeeSheet({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      console.log("Submitting form data for employee:", employee.id)

      const result = await updateEmployee(employee.id, formData)
      console.log("Update result:", result)

      // Force refresh the page data
      router.refresh()

      // Close the sheet
      onOpenChange(false)
    } catch (e) {
      console.error("Error updating employee:", e)
      setError(e instanceof Error ? e.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Employee</SheetTitle>
          <SheetDescription>Update the details for the employee.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={employee.name} placeholder="e.g., Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Position</Label>
            <Input id="role" name="role" defaultValue={employee.role || ""} placeholder="e.g., Software Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              step="0.01"
              defaultValue={employee.salary}
              placeholder="5000.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              name="hire_date"
              type="date"
              defaultValue={new Date(employee.hire_date).toISOString().split("T")[0]}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
