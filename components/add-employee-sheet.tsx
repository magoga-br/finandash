"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, AlertCircle } from "lucide-react"
import { addEmployee } from "@/app/dashboard/payroll/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AddEmployeeSheet() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      await addEmployee(formData)
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error("Error adding employee:", e)
      setError(e instanceof Error ? e.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setError(null)
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Employee</SheetTitle>
          <SheetDescription>Enter the details for the new employee.</SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Position</Label>
            <Input id="role" name="role" placeholder="e.g., Software Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input id="salary" name="salary" type="number" step="0.01" placeholder="5000.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              name="hire_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Employee"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
