"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: "INSERT" | "UPDATE" | "DELETE"
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  changed_fields?: string[]
  created_at: string
}

export function AuditTrail() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAuditLogs() {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching audit logs:", error)
      } else {
        setAuditLogs(data || [])
      }
      setLoading(false)
    }

    fetchAuditLogs()
  }, [supabase])

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading audit trail...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>Recent changes to your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  <span className="font-medium capitalize">{log.table_name.replace("_", " ")}</span>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
              </div>

              {log.changed_fields && log.changed_fields.length > 0 && (
                <div className="text-sm text-muted-foreground">Changed fields: {log.changed_fields.join(", ")}</div>
              )}

              {log.action === "UPDATE" && log.old_values && log.new_values && (
                <div className="mt-2 text-sm">
                  {log.changed_fields?.map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <span className="font-medium">{field}:</span>
                      <span className="text-red-600 line-through">{String(log.old_values?.[field] || "")}</span>
                      <span>→</span>
                      <span className="text-green-600">{String(log.new_values?.[field] || "")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {auditLogs.length === 0 && <div className="text-center py-8 text-muted-foreground">No audit logs found.</div>}
        </div>
      </CardContent>
    </Card>
  )
}
