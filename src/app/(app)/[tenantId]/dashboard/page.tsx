import { getOrders } from "@/actions/order.actions";
import { getProductsByMarket } from "@/actions/products.actions";
import { getUserByAuth0Id } from "@/actions/user.actions";
import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartBarMultiple } from "@/app/components/charts/ChartBarMultiple";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Order } from "@/app/domain/orderDomain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

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
                    size: 100,
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
            } catch (error) {
                console.error('Erro ao buscar pedidos:', error);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }

    return (
        <div className="space-y-6">
            <HeaderInfo title="Dashboard" description="Bem-vindo ao painel administrativo" />

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
                    <ChartBarMultiple />
                </div>
                <div className="col-span-1">
                    <ChartPieLabel />
                </div>
                <div className="col-span-1">
                    <ChartAreaDefault />
                </div>
            </div>
        </div>
    );
}
