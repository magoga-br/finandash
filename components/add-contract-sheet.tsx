"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, AlertCircle } from "lucide-react"
import { addContract } from "@/app/dashboard/contracts/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AddContractSheet() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      await addContract(formData)
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error("Error adding contract:", e)
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contract
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Contract</SheetTitle>
          <SheetDescription>Record a new client contract or agreement.</SheetDescription>
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
            <Label htmlFor="client_name">Client Name</Label>
            <Input id="client_name" name="client_name" placeholder="e.g., Acme Inc." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Contract Title</Label>
            <Input id="title" name="title" placeholder="e.g., Q3 Marketing Services" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_value">Total Value</Label>
            <Input id="total_value" name="total_value" type="number" step="0.01" placeholder="1000.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Contract"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
