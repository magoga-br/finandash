import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PayrollTable } from "@/components/payroll-table"
import { AddEmployeeSheet } from "@/components/add-employee-sheet"
import { RunPayrollButton } from "@/components/run-payroll-button"

async function getPayrollData(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching employees:", error.message)
    return { employees: null, totalMonthlyCost: 0, error: error.message }
  }

  const totalMonthlyCost = data.reduce((sum, emp) => sum + Number.parseFloat(emp.salary.toString()), 0)
  return { employees: data, totalMonthlyCost, error: null }
}

export default async function PayrollPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { employees, totalMonthlyCost, error } = await getPayrollData(user.id)

  if (error || !employees) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900/20 dark:text-red-400"
        role="alert"
      >
        <p className="font-bold">Erro no Banco de Dados</p>
        <p>
          Não foi possível buscar os dados da folha de pagamento. Isso provavelmente ocorre porque a tabela 'employees'
          não existe no seu banco de dados. Por favor, execute o script SQL fornecido para configurar o esquema do seu
          banco de dados.
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
          <h1 className="text-3xl font-bold text-foreground">Folha de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie seus funcionários e processe a folha de pagamento.</p>
        </div>
        <div className="flex space-x-2">
          <AddEmployeeSheet />
          <RunPayrollButton employees={employees} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
          <CardDescription>
            Você tem {employees.length} funcionários. Custo total mensal da folha de pagamento:{" "}
            {totalMonthlyCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollTable employees={employees} />
        </CardContent>
      </Card>
    </div>
  )
}
