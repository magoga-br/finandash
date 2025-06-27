import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, PieChart, TrendingUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">FinanDash</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Ir para o Painel</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Começar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Contabilidade Simplificada
            <span className="text-blue-600"> e Descomplicada</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Assuma o controle de suas finanças com nosso painel intuitivo. Acompanhe transações, monitore gastos e
            obtenha insights sobre sua saúde financeira.
          </p>
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button size="lg" className="text-lg px-8 py-3">
              Comece a Gerenciar Suas Finanças
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Tudo o que Você Precisa para Gerenciar Seu Dinheiro
          </h3>
          <p className="text-lg text-muted-foreground">
            Ferramentas simples e poderosas projetadas para a gestão financeira moderna
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Rastreamento de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Registre e categorize facilmente todas as suas receitas e despesas em um só lugar
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Relatórios Visuais</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Gráficos e relatórios bonitos para entender seus padrões de gastos</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Insights Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Obtenha insights práticos para melhorar sua saúde financeira</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Gerenciamento de Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Gerencie múltiplas contas e acompanhe saldos em tempo real</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para Assumir o Controle?</h3>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de usuários que simplificaram sua gestão financeira
          </p>
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Crie Sua Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <DollarSign className="h-6 w-6" />
            <span className="text-lg font-semibold">FinanDash</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 FinanDash. Todos os direitos reservados. Contabilidade simplificada e descomplicada.
          </p>
        </div>
      </footer>
    </div>
  )
}
