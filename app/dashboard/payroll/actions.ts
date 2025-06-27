"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { safeCreateAuditLog, getChangedFields } from "@/lib/audit"

export async function addEmployee(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const employeeData = {
    user_id: user.id,
    name: formData.get("name") as string,
    role: formData.get("role") as string,
    salary: Number.parseFloat(formData.get("salary") as string),
    hire_date: formData.get("hire_date") as string,
  }

  const { data, error } = await supabase.from("employees").insert(employeeData).select().single()

  if (error) throw new Error("Failed to add employee")

  await safeCreateAuditLog({
    table_name: "employees",
    record_id: data.id,
    action: "INSERT",
    new_values: employeeData,
  }).catch((auditError) => {
    console.warn("Audit logging failed (non-critical):", auditError)
  })

  revalidatePath("/dashboard/payroll")
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingEmployee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("user_id", user.id)
    .single()
  if (!existingEmployee) throw new Error("Employee not found or permission denied.")

  const newValues = {
    name: formData.get("name") as string,
    role: formData.get("role") as string,
    salary: Number.parseFloat(formData.get("salary") as string),
    hire_date: formData.get("hire_date") as string,
  }

  const { error, count } = await supabase
    .from("employees")
    .update(newValues, { count: "exact" })
    .eq("id", employeeId)
    .eq("user_id", user.id)

  if (error) throw new Error(`Failed to update employee: ${error.message}`)

  if (count === 0) {
    throw new Error("Update failed: The employee was not found or you do not have permission to edit it.")
  }

  const changedFields = getChangedFields(existingEmployee, newValues)
  if (changedFields.length > 0) {
    await safeCreateAuditLog({
      table_name: "employees",
      record_id: employeeId,
      action: "UPDATE",
      old_values: existingEmployee,
      new_values: newValues,
      changed_fields: changedFields,
    })
  }

  revalidatePath("/dashboard/payroll")
  return { success: true }
}

export async function deleteEmployee(employeeId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingEmployee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("user_id", user.id)
    .single()

  if (!existingEmployee) {
    throw new Error("Employee not found or permission denied.")
  }

  const { error } = await supabase.from("employees").delete().eq("id", employeeId).eq("user_id", user.id)

  if (error) throw new Error("Failed to delete employee")

  await safeCreateAuditLog({
    table_name: "employees",
    record_id: employeeId,
    action: "DELETE",
    old_values: existingEmployee,
  }).catch((auditError) => {
    console.warn("Audit logging failed (non-critical):", auditError)
  })

  revalidatePath("/dashboard/payroll")
}

export async function runPayroll(employees: { id: string; name: string; salary: string }[]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const payrollTransactions = employees.map((emp) => ({
    user_id: user.id,
    description: `Payroll: ${emp.name}`,
    amount: -Math.abs(Number.parseFloat(emp.salary)),
    type: "expense",
    category: "Payroll",
    date: new Date().toISOString().split("T")[0],
  }))

  const { error } = await supabase.from("transactions").insert(payrollTransactions)

  if (error) throw new Error("Failed to process payroll")

  revalidatePath("/dashboard")
}
