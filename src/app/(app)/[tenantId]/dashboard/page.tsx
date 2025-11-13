import { getUserByAuth0Id } from "@/actions/user.actions";
import { getReportsSummary } from "@/actions/reports.actions";
import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChartPaymentMethod } from "@/app/components/charts/ChartPaymentMethod";

export default async function DashboardPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    const user = session.user;
    const auth0Id = user?.sub || '';

    let marketId: string | null = tenantId ?? null;
    let totalProducts = 0;
    let totalOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;
    let statusData: Array<{ status: string; pedidos: number }> = [];
    let paymentData: Array<{ method: string; value: number }> = [];
    let weeklyTicketData: Array<{ semana: string; ticket: number }> = [];

    try {
        if (auth0Id) {
            const backendUser = await getUserByAuth0Id(auth0Id);
            const userMarketId = backendUser.marketId;

            if (userMarketId) {
                marketId = userMarketId;
            }

            if (marketId) {
                const summary = await getReportsSummary(marketId, { days: 30, weeks: 6, top: 5 });
                totalProducts = summary.totalProducts;
                totalOrders = summary.totalOrders;
                pendingOrders = summary.pendingOrders;
                totalRevenue = summary.totalRevenue;
                statusData = summary.statusData;
                paymentData = summary.paymentData;
                weeklyTicketData = summary.weeklyTicketData;
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
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
                    <div className="mt-2 text-right">
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
        </div>
    );
}
