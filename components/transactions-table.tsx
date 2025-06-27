"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { EditTransactionSheet } from "./edit-transaction-sheet"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { deleteTransaction } from "@/app/dashboard/actions"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  description: string
  amount: string
  category: string
  type: "income" | "expense"
  date: string
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Optimistic updates
  const [optimisticTransactions, updateOptimisticTransactions] = useOptimistic(
    transactions,
    (state, updatedTransaction: Transaction) => {
      return state.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    },
  )

  const handleOptimisticUpdate = (updatedTransaction: Transaction) => {
    startTransition(() => {
      updateOptimisticTransactions(updatedTransaction)
    })
  }

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId)
      toast({
        variant: "success",
        title: "Transação Excluída",
        description: "A transação foi excluída com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao Excluir",
        description: "Falha ao excluir a transação. Por favor, tente novamente.",
      })
      throw error
    }
  }

  if (optimisticTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma transação encontrada. Adicione sua primeira transação para começar.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {optimisticTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium">{transaction.description}</p>
                <Badge variant="secondary">{transaction.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`text-right font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {Math.abs(Number.parseFloat(transaction.amount)).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeletingTransaction(transaction)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {editingTransaction && (
        <EditTransactionSheet
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onOptimisticUpdate={handleOptimisticUpdate}
        />
      )}

      {deletingTransaction && (
        <DeleteConfirmationDialog
          itemType="transação"
          itemName={deletingTransaction.description}
          open={!!deletingTransaction}
          onOpenChange={(open) => !open && setDeletingTransaction(null)}
          onConfirm={() => handleDelete(deletingTransaction.id)}
        />
      )}
    </>
  )
}
