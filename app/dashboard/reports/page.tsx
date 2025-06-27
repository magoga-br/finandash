import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfitLossReport } from "@/components/profit-loss-report"
import { CategorySpendingReport } from "@/components/category-spending-report"

async function getTransactions(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, category, date")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching transactions for reports:", error.message)
    return { data: null, error: error.message }
  }
  return { data, error: null }
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: transactions, error } = await getTransactions(user.id)

  if (error || !transactions) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400"
        role="alert"
      >
        <p className="font-bold">Erro no Banco de Dados</p>
        <p>
          Não foi possível buscar os dados de transação para os relatórios. Isso provavelmente ocorre porque a tabela
          'transactions' não existe no seu banco de dados. Por favor, execute o script SQL fornecido para configurar o
          esquema do seu banco de dados.
        </p>
        <p className="text-sm mt-2">
          <strong>Detalhes:</strong> {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Analise seu desempenho financeiro e hábitos de consumo.</p>
      </div>

      <Tabs defaultValue="profit-loss">
        <TabsList>
          <TabsTrigger value="profit-loss">Lucros e Perdas</TabsTrigger>
          <TabsTrigger value="spending">Gastos por Categoria</TabsTrigger>
        </TabsList>
        <TabsContent value="profit-loss" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Demonstrativo de Lucros e Perdas</CardTitle>
              <CardDescription>Uma visão geral de suas receitas e despesas ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitLossReport transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="spending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Uma análise detalhada de suas despesas por categoria.</CardDescription>
            </CardHeader>
            <CardContent>
              <CategorySpendingReport transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
