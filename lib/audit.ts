import { createClient } from "@/lib/supabase/server"

export interface AuditLogEntry {
  table_name: string
  record_id: string
  action: "INSERT" | "UPDATE" | "DELETE"
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  changed_fields?: string[]
}

/**
 * Creates an audit log entry. This function is designed to fail silently
 * if there's an issue, to prevent it from blocking the main operation.
 */
export async function safeCreateAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn("Audit log skipped: User not authenticated.")
      return
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      table_name: entry.table_name,
      record_id: entry.record_id,
      action: entry.action,
      old_values: entry.old_values || null,
      new_values: entry.new_values || null,
      changed_fields: entry.changed_fields || null,
    })

    if (error) {
      console.warn(`Failed to create audit log (non-critical): ${error.message}`)
      if (error.message.includes("row-level security")) {
        console.warn("Hint: Ensure the 'audit_trail_fixed.sql' script has been run.")
      }
    }
  } catch (e) {
    console.warn(`An unexpected error occurred in safeCreateAuditLog: ${e}`)
  }
}

export function getChangedFields(oldValues: Record<string, any>, newValues: Record<string, any>): string[] {
  const changedFields: string[] = []
  for (const key in newValues) {
    if (Object.prototype.hasOwnProperty.call(newValues, key) && oldValues[key] !== newValues[key]) {
      changedFields.push(key)
    }
  }
  return changedFields
}
