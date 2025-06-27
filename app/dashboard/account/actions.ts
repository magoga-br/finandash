"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado." }
  }

  const fullName = formData.get("full_name") as string
  const avatarFile = formData.get("avatar") as File

  if (!fullName || fullName.trim().length < 3) {
    return { error: "O nome completo deve ter pelo menos 3 caracteres." }
  }

  let avatarUrl: string | undefined = undefined

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      return { error: "O arquivo de imagem não pode ser maior que 5MB." }
    }
    const fileExt = avatarFile.name.split(".").pop()
    const filePath = `${user.id}/${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile)

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      return { error: "Falha ao enviar o avatar." }
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    avatarUrl = urlData.publicUrl
  }

  const updates: { full_name: string; avatar_url?: string; updated_at: string } = {
    full_name: fullName.trim(),
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl) {
    updates.avatar_url = avatarUrl
  }

  const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile:", updateError)
    return { error: "Falha ao atualizar o perfil." }
  }

  revalidatePath("/dashboard", "layout")
  return { error: null }
}
