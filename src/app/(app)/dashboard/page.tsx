import { auth0 } from "@/lib/auth0";
import { getUserByAuth0Id } from "@/actions/user.actions";
import { getOrders } from "@/actions/order.actions";
import { getProductsByMarket } from "@/actions/products.actions";
import { getMarketById } from "@/actions/market.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, TrendingUp, DollarSign, Plus, Store, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Order } from "@/app/domain/orderDomain";

export default async function DashboardPage() {
    const session = await auth0.getSession();
    
    if (!session) {
        redirect('/auth/login');
    }

    const user = session.user;
    const auth0Id = user?.sub || '';

    let marketId: string | null = null;
    let marketName = 'Seu Mercado';
    let marketAddress = '';
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
                try {
                    const market = await getMarketById(userMarketId);
                    marketName = market.name;
                    marketAddress = market.address;
                } catch (error) {
                    console.error('Erro ao buscar mercado:', error);
                }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Bem-vindo ao painel administrativo
                    </p>
                </div>
            </div>

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

            {/* Acesso Rápido */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/admin/products">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Gerenciar Produtos
                            </CardTitle>
                            <CardDescription>
                                Visualize, edite e gerencie seus produtos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Ver Produtos
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/admin/products/create">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Cadastrar Produto
                            </CardTitle>
                            <CardDescription>
                                Adicione novos produtos ao seu catálogo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Criar Produto
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/admin/settings">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Configurações
                            </CardTitle>
                            <CardDescription>
                                Configure as opções do seu mercado
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Abrir Configurações
                            </Button>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            {/* Informações do Mercado */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Informações do Mercado
                    </CardTitle>
                    <CardDescription>
                        Dados principais do seu estabelecimento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="text-lg">{marketName}</p>
                        </div>
                        {marketAddress && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                                <p className="text-lg">{marketAddress}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
