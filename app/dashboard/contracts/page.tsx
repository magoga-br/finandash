import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractsTable } from "@/components/contracts-table"
import { AddContractSheet } from "@/components/add-contract-sheet"

async function getContracts(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contracts:", error.message)
    return { data: null, error: error.message }
  }
  return { data, error: null }
}

export default async function ContractsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: contracts, error } = await getContracts(user.id)

  if (error || !contracts) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400"
        role="alert"
      >
        <p className="font-bold">Erro no Banco de Dados</p>
        <p>
          Não foi possível buscar os contratos. Isso provavelmente ocorre porque a tabela 'contracts' não existe no seu
          banco de dados. Por favor, execute o script SQL fornecido para configurar o esquema do seu banco de dados.
        </p>
        <p className="text-sm mt-2">
          <strong>Detalhes:</strong> {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gerencie seus contratos e acordos com clientes.</p>
        </div>
        <AddContractSheet />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Contratos</CardTitle>
          <CardDescription>Uma lista de todos os seus contratos ativos e passados.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractsTable contracts={contracts} />
        </CardContent>
      </Card>
    </div>
  )
}
