"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { EditEmployeeSheet } from "./edit-employee-sheet"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { deleteEmployee } from "@/app/dashboard/payroll/actions"

interface Employee {
  id: string
  name: string
  role: string | null
  salary: string
  hire_date: string
}

interface PayrollTableProps {
  employees: Employee[]
}

export function PayrollTable({ employees }: PayrollTableProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  if (employees.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No employees found. Add one to get started.</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead className="text-right">Monthly Salary</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.role || "N/A"}</TableCell>
              <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                ${Number.parseFloat(employee.salary).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingEmployee(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingEmployee(employee)} className="text-red-600">
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

      {editingEmployee && (
        <EditEmployeeSheet
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}

      {deletingEmployee && (
        <DeleteConfirmationDialog
          itemType="employee"
          itemName={deletingEmployee.name}
          open={!!deletingEmployee}
          onOpenChange={(open) => !open && setDeletingEmployee(null)}
          onConfirm={() => deleteEmployee(deletingEmployee.id)}
        />
      )}
    </>
  )
}
