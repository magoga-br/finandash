"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { safeCreateAuditLog, getChangedFields } from "@/lib/audit"

// Simple validation without Zod for now
function validateTransactionData(formData: FormData) {
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const type = formData.get("type") as "income" | "expense"
  const category = formData.get("category") as string
  const date = formData.get("date") as string

  if (!description || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória")
  }
  if (isNaN(amount) || amount <= 0) {
    throw new Error("O valor deve ser um número positivo")
  }
  if (!type || !["income", "expense"].includes(type)) {
    throw new Error("Um tipo válido é obrigatório")
  }
  if (!category || category.trim().length === 0) {
    throw new Error("A categoria é obrigatória")
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Uma data válida é obrigatória")
  }

  return { description: description.trim(), amount, type, category: category.trim(), date }
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const validatedData = validateTransactionData(formData)
  const finalAmount =
    validatedData.type === "expense" ? -Math.abs(validatedData.amount) : Math.abs(validatedData.amount)
  const transactionData = { ...validatedData, amount: finalAmount, user_id: user.id }

  const { data, error } = await supabase.from("transactions").insert(transactionData).select().single()

  if (error) {
    throw new Error(`Failed to add transaction: ${error.message}`)
  }

  await safeCreateAuditLog({
    table_name: "transactions",
    record_id: data.id,
    action: "INSERT",
    new_values: transactionData,
  })

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingTransaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single()
  if (!existingTransaction) throw new Error("Transação não encontrada ou permissão negada.")

  const validatedData = validateTransactionData(formData)
  const finalAmount =
    validatedData.type === "expense" ? -Math.abs(validatedData.amount) : Math.abs(validatedData.amount)
  const newValues = { ...validatedData, amount: finalAmount }

  const { error, count } = await supabase
    .from("transactions")
    .update(newValues, { count: "exact" })
    .eq("id", transactionId)
    .eq("user_id", user.id)

  if (error) throw new Error(`Falha ao atualizar transação: ${error.message}`)

  if (count === 0) {
    throw new Error("Falha na atualização: A transação não foi encontrada ou você não tem permissão para editá-la.")
  }

  const changedFields = getChangedFields(existingTransaction, newValues)
  if (changedFields.length > 0) {
    await safeCreateAuditLog({
      table_name: "transactions",
      record_id: transactionId,
      action: "UPDATE",
      old_values: existingTransaction,
      new_values: newValues,
      changed_fields: changedFields,
    })
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingTransaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single()

  if (!existingTransaction) {
    throw new Error("Transação não encontrada ou permissão negada.")
  }

  const { error } = await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", user.id)

  if (error) {
    throw new Error(`Falha ao excluir transação: ${error.message}`)
  }

  await safeCreateAuditLog({
    table_name: "transactions",
    record_id: transactionId,
    action: "DELETE",
    old_values: existingTransaction,
  })

  revalidatePath("/dashboard")
  return { success: true }
}
