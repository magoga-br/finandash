"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditContractSheet } from "./edit-contract-sheet"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { deleteContract } from "@/app/dashboard/contracts/actions"

interface Contract {
  id: string
  client_name: string
  title: string
  total_value: string
  start_date: string
  end_date: string | null
  status: "active" | "pending" | "completed" | "cancelled"
}

interface ContractsTableProps {
  contracts: Contract[]
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null)

  if (contracts.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No contracts found. Add one to get started.</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.client_name}</TableCell>
              <TableCell>{contract.title}</TableCell>
              <TableCell>
                <Badge
                  className={cn({
                    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400":
                      contract.status === "active",
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400":
                      contract.status === "pending",
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400": contract.status === "completed",
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300": contract.status === "cancelled",
                  })}
                >
                  {contract.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(contract.start_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">${Number.parseFloat(contract.total_value).toLocaleString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingContract(contract)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingContract && (
        <EditContractSheet
          contract={editingContract}
          open={!!editingContract}
          onOpenChange={(open) => !open && setEditingContract(null)}
        />
      )}

      {deletingContract && (
        <DeleteConfirmationDialog
          itemType="contract"
          itemName={deletingContract.title}
          open={!!deletingContract}
          onOpenChange={(open) => !open && setDeletingContract(null)}
          onConfirm={() => deleteContract(deletingContract.id)}
        />
      )}
    </>
  )
}
