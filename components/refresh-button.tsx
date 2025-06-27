"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isPending} aria-label="Refresh data">
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Atualizar dados</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
