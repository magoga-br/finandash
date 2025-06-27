"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertCircle } from "lucide-react"
import { updateTransaction } from "@/app/dashboard/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  description: string
  amount: string
  category: string
  type: "income" | "expense"
  date: string
}

const categories = [
  "Alimentação",
  "Transporte",
  "Compras",
  "Entretenimento",
  "Contas e Serviços",
  "Saúde",
  "Educação",
  "Viagem",
  "Salário",
  "Negócios",
  "Investimento",
  "Outros",
]

export function EditTransactionSheet({
  transaction,
  open,
  onOpenChange,
  onOptimisticUpdate,
}: {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onOptimisticUpdate?: (updatedTransaction: Transaction) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Optimistic update
    if (onOptimisticUpdate) {
      const optimisticTransaction: Transaction = {
        ...transaction,
        description: formData.get("description") as string,
        amount: formData.get("amount") as string,
        type: formData.get("type") as "income" | "expense",
        category: formData.get("category") as string,
        date: formData.get("date") as string,
      }
      onOptimisticUpdate(optimisticTransaction)
    }

    startTransition(async () => {
      try {
        const result = await updateTransaction(transaction.id, formData)

        if (result.success) {
          toast({
            variant: "success",
            title: "Transação Atualizada",
            description: "Sua transação foi atualizada com sucesso.",
          })
          onOpenChange(false)
          router.refresh() // This is now handled by revalidatePath in the action
        } else {
          // This case might not be hit if action throws an error
          setError("Ocorreu um erro desconhecido.")
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido."
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Falha na Atualização",
          description: errorMessage,
        })
        // Revert optimistic update if needed, though revalidation will handle this
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Transação</SheetTitle>
          <SheetDescription>Atualize os detalhes da sua transação.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" defaultValue={transaction.description} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              defaultValue={Math.abs(Number.parseFloat(transaction.amount))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" defaultValue={transaction.type} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue={transaction.category} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date(transaction.date).toISOString().split("T")[0]}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
