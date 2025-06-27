"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { safeCreateAuditLog, getChangedFields } from "@/lib/audit"

export async function addContract(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const contractData = {
    user_id: user.id,
    client_name: formData.get("client_name") as string,
    title: formData.get("title") as string,
    total_value: Number.parseFloat(formData.get("total_value") as string),
    status: formData.get("status") as string,
    start_date: formData.get("start_date") as string,
  }

  const { data, error } = await supabase.from("contracts").insert(contractData).select().single()

  if (error) throw new Error("Failed to add contract")

  await safeCreateAuditLog({
    table_name: "contracts",
    record_id: data.id,
    action: "INSERT",
    new_values: contractData,
  }).catch((auditError) => {
    console.warn("Audit logging failed (non-critical):", auditError)
  })

  revalidatePath("/dashboard/contracts")
}

export async function updateContract(contractId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingContract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("user_id", user.id)
    .single()
  if (!existingContract) throw new Error("Contract not found or permission denied.")

  const newValues = {
    client_name: formData.get("client_name") as string,
    title: formData.get("title") as string,
    total_value: Number.parseFloat(formData.get("total_value") as string),
    status: formData.get("status") as string,
    start_date: formData.get("start_date") as string,
  }

  const { error, count } = await supabase
    .from("contracts")
    .update(newValues, { count: "exact" })
    .eq("id", contractId)
    .eq("user_id", user.id)

  if (error) throw new Error(`Failed to update contract: ${error.message}`)

  if (count === 0) {
    throw new Error("Update failed: The contract was not found or you do not have permission to edit it.")
  }

  const changedFields = getChangedFields(existingContract, newValues)
  if (changedFields.length > 0) {
    await safeCreateAuditLog({
      table_name: "contracts",
      record_id: contractId,
      action: "UPDATE",
      old_values: existingContract,
      new_values: newValues,
      changed_fields: changedFields,
    })
  }

  revalidatePath("/dashboard/contracts")
  return { success: true }
}

export async function deleteContract(contractId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: existingContract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("user_id", user.id)
    .single()

  if (!existingContract) {
    throw new Error("Contract not found or permission denied.")
  }

  const { error } = await supabase.from("contracts").delete().eq("id", contractId).eq("user_id", user.id)

  if (error) throw new Error("Failed to delete contract")

  await safeCreateAuditLog({
    table_name: "contracts",
    record_id: contractId,
    action: "DELETE",
    old_values: existingContract,
  }).catch((auditError) => {
    console.warn("Audit logging failed (non-critical):", auditError)
  })

  revalidatePath("/dashboard/contracts")
}
