import { getOrders } from "@/actions/order.actions";
import { getProductsByMarket } from "@/actions/products.actions";
import { getUserByAuth0Id } from "@/actions/user.actions";
import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Order } from "@/app/domain/orderDomain";
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
                const products = await getProductsByMarket(marketId, { page: 1, size: 100 });
                totalProducts = products.meta?.total || products.products.length;
            }

            // Buscar pedidos do mercado
            try {
                const ordersData = await getOrders({
                    page: 1,
                    size: 1000,
                    marketId: marketId || undefined
                });
                const orders = ordersData.orders || [];
                totalOrders = ordersData.meta?.total || orders.length;
                pendingOrders = orders.filter((order: Order) =>
                    ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
                ).length;
                totalRevenue = orders
                    .filter((order: Order) => order.status === 'DELIVERED')
                    .reduce((sum: number, order: Order) => sum + (order.total || 0), 0);

                // Métricas para gráficos
                // 1) Distribuição por status
                const statusCounts = orders.reduce<Record<string, number>>((acc, o: Order) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {});
                statusData = Object.entries(statusCounts).map(([status, count]) => ({
                    status:
                        status === 'DELIVERED' ? 'Entregues' :
                        status === 'PREPARING' ? 'Preparando' :
                        status === 'CONFIRMED' ? 'Confirmados' :
                        status === 'PENDING' ? 'Pendentes' :
                        status === 'CANCELLED' ? 'Cancelados' : status,
                    pedidos: count,
                }));

                // 2) Faturamento por método de pagamento (somente entregues)
                const paymentRevenueMap = orders
                    .filter((o: Order) => o.status === 'DELIVERED')
                    .reduce<Record<string, number>>((acc, o: Order) => {
                        const method = o.paymentMethod || 'OUTRO';
                        acc[method] = (acc[method] || 0) + (o.total || 0);
                        return acc;
                    }, {});
                const methodLabel = (m: string) =>
                    m === 'CREDIT_CARD' ? 'Crédito' :
                    m === 'DEBIT_CARD' ? 'Débito' :
                    m === 'PIX' ? 'PIX' :
                    m === 'CASH' ? 'Dinheiro' : 'Outro';
                paymentData = Object.entries(paymentRevenueMap).map(([method, value]) => ({
                    method: methodLabel(method),
                    value,
                }));

                // 3) Ticket médio semanal (últimas 6 semanas, somente entregues)
                const delivered = orders.filter((o: Order) => o.status === 'DELIVERED');
                const byWeek = new Map<string, { sum: number; count: number }>();
                for (const o of delivered) {
                    const d = new Date(o.createdAt);
                    // ISO week key: YYYY-WW
                    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                    const dayNum = date.getUTCDay() || 7;
                    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
                    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
                    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                    const key = `${date.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
                    const r = byWeek.get(key) || { sum: 0, count: 0 };
                    r.sum += o.total || 0;
                    r.count += 1;
                    byWeek.set(key, r);
                }
                const sortedWeeks = Array.from(byWeek.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
                const weekLabel = (key: string) => {
                    const [y, w] = key.split('-').map((x) => Number(x));
                    // Approximated label "Sem Y-WW"
                    return `Sem ${String(w).padStart(2, '0')}/${String(y).slice(-2)}`;
                };
                weeklyTicketData = sortedWeeks.map(([key, v]) => ({
                    semana: weekLabel(key),
                    ticket: v.count > 0 ? v.sum / v.count : 0,
                }));
            } catch (error) {
                console.error('Erro ao buscar pedidos:', error);
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
