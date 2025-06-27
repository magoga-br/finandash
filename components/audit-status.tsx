"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuditStatus {
  available: boolean
  reason?: string
  lastChecked: Date
}

export function AuditStatus() {
  const [status, setStatus] = useState<AuditStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuditStatus = async () => {
    setLoading(true)
    try {
      // This would call your audit availability check
      // For now, we'll simulate the check
      const response = await fetch("/api/audit-status")
      if (response.ok) {
        const data = await response.json()
        setStatus({
          available: data.available,
          reason: data.reason,
          lastChecked: new Date(),
        })
      } else {
        setStatus({
          available: false,
          reason: "Unable to check audit status",
          lastChecked: new Date(),
        })
      }
    } catch (error) {
      setStatus({
        available: false,
        reason: "Network error checking audit status",
        lastChecked: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuditStatus()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking Audit Status...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audit Trail Status</span>
          <Badge variant={status.available ? "default" : "destructive"}>
            {status.available ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
        <CardDescription>Last checked: {status.lastChecked.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        {status.available ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Audit Logging Active</AlertTitle>
            <AlertDescription>All changes to your data are being tracked and logged.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Audit Logging Inactive</AlertTitle>
            <AlertDescription>
              {status.reason || "Audit logging is currently unavailable."}
              {status.reason?.includes("RLS") && (
                <div className="mt-2">
                  <strong>Solution:</strong> Run the audit_trail_fixed.sql script in your Supabase SQL editor to fix the
                  row-level security policies.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={checkAuditStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>

          {!status.available && (
            <Alert className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your application will continue to work normally even without audit logging. This is a non-critical
                feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
