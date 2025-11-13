import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartBarInteractive } from "@/app/components/charts/ChartBarInteractive";
import { ChartPaymentMethod } from "@/app/components/charts/ChartPaymentMethod";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Dados mockados para os gráficos
    const totalProducts = 156;
    const totalOrders = 342;
    const pendingOrders = 23;
    const totalRevenue = 45230.50;

    const statusData: Array<{ status: string; pedidos: number }> = [
        { status: "Entregues", pedidos: 245 },
        { status: "Preparando", pedidos: 45 },
        { status: "Confirmados", pedidos: 28 },
        { status: "Pendentes", pedidos: 23 },
        { status: "Cancelados", pedidos: 1 },
    ];

    const paymentData: Array<{ method: string; value: number }> = [
        { method: "PIX", value: 18500.00 },
        { method: "Cartão de Crédito", value: 15230.50 },
        { method: "Cartão de Débito", value: 8500.00 },
        { method: "Dinheiro", value: 3000.00 },
    ];

    const weeklyTicketData: Array<{ semana: string; ticket: number }> = [
        { semana: "Sem 1", ticket: 125.50 },
        { semana: "Sem 2", ticket: 132.30 },
        { semana: "Sem 3", ticket: 118.75 },
        { semana: "Sem 4", ticket: 145.20 },
        { semana: "Sem 5", ticket: 139.80 },
        { semana: "Sem 6", ticket: 152.40 },
    ];

    // Gerar dados diários de faturamento e ticket médio (últimos 30 dias)
    const dailyRevenueData: Array<{ date: string; faturamento: number; ticketMedio: number }> = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Faturamento diário variando entre 1000 e 3000
        const baseFaturamento = 1000 + Math.random() * 2000;
        // Ticket médio variando entre 120 e 160
        const baseTicketMedio = 120 + Math.random() * 40;

        dailyRevenueData.push({
            date: dateStr,
            faturamento: Math.round(baseFaturamento * 100) / 100,
            ticketMedio: Math.round(baseTicketMedio * 100) / 100,
        });
    }

    return (
        <div className="space-y-6">
            <HeaderInfo title="Tela Inicial" description="Bem-vindo ao painel administrativo" />

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Produtos
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Produtos cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Pedidos
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Pedidos realizados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pedidos Pendentes
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando processamento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Receita Total
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Receita de pedidos entregues
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 grid-cols-3">
                <div className="col-span-1">
                    <ChartPaymentMethod data={paymentData} />
                </div>
                <div className="col-span-1">
                    <ChartPieLabel data={statusData} />
                </div>
                <div className="col-span-1 flex flex-col">
                    <ChartAreaDefault data={weeklyTicketData} />
                </div>
                <div className="col-span-3">
                    <ChartBarInteractive
                        data={dailyRevenueData}
                        title="Evolução Diária"
                        subtitle="Últimos 30 dias - Faturamento e Ticket Médio"
                    />
                </div>
                <div className="text-right col-span-1 col-start-3">
                    <Link
                        href={`/${tenantId}/reports`}
                        className="text-xs text-primary hover:underline"
                        aria-label="Ver mais dados em Relatórios"
                    >
                        Ver mais dados
                    </Link>
                </div>
            </div>
        </div>
    );
}
