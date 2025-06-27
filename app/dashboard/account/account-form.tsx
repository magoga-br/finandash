"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "./actions"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface Profile {
  full_name: string | null
  avatar_url: string | null
}

export function AccountForm({ user, profile }: { user: User; profile: Profile | null }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setAvatarUrl(profile?.avatar_url || null)
  }, [profile?.avatar_url])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar perfil",
          description: result.error,
        })
      } else {
        toast({
          variant: "success",
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        })
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
          <AvatarFallback>{profile?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="avatar">Foto de Perfil</Label>
          <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
          <p className="text-sm text-muted-foreground">Envie uma nova foto de perfil.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Nome Completo</Label>
        <Input id="full_name" name="full_name" type="text" defaultValue={profile?.full_name || ""} />
      </div>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
