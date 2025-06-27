"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertCircle } from "lucide-react"
import { updateContract } from "@/app/dashboard/contracts/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Contract {
  id: string
  client_name: string
  title: string
  total_value: string
  start_date: string
  status: "active" | "pending" | "completed" | "cancelled"
}

export function EditContractSheet({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract
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
      console.log("Submitting form data for contract:", contract.id)

      const result = await updateContract(contract.id, formData)
      console.log("Update result:", result)

      // Force refresh the page data
      router.refresh()

      // Close the sheet
      onOpenChange(false)
    } catch (e) {
      console.error("Error updating contract:", e)
      setError(e instanceof Error ? e.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Contract</SheetTitle>
          <SheetDescription>Update the details of the contract.</SheetDescription>
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
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              name="client_name"
              defaultValue={contract.client_name}
              placeholder="e.g., Acme Inc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Contract Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={contract.title}
              placeholder="e.g., Q3 Marketing Services"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_value">Total Value</Label>
            <Input
              id="total_value"
              name="total_value"
              type="number"
              step="0.01"
              defaultValue={contract.total_value}
              placeholder="1000.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={contract.status} required>
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
              defaultValue={new Date(contract.start_date).toISOString().split("T")[0]}
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
