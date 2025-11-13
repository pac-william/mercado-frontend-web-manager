import { getOrders } from "@/actions/order.actions";
import { getProductsByMarket } from "@/actions/products.actions";
import { getUserByAuth0Id } from "@/actions/user.actions";
import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartPaymentMethod } from "@/app/components/charts/ChartPaymentMethod";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { ChartRevenueDaily } from "@/app/components/charts/ChartRevenueDaily";
import { ChartTopProducts } from "@/app/components/charts/ChartTopProducts";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import { Order } from "@/app/domain/orderDomain";
import { ProductPaginatedResponse } from "@/app/domain/productDomain";
import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { Download } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ReportsPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const session = await auth0.getSession();
    if (!session) {
        redirect('/auth/login');
    }

    const user = session.user;
    const auth0Id = user?.sub || '';

    let marketId: string | null = tenantId ?? null;

    // datasets
    let statusData: Array<{ status: string; pedidos: number }> = [];
    let paymentData: Array<{ method: string; value: number }> = [];
    let weeklyTicketData: Array<{ semana: string; ticket: number }> = [];
    let revenueDailyData: Array<{ date: string; revenue: number }> = [];
    let topProductsData: Array<{ name: string; quantity: number }> = [];

    try {
        if (auth0Id) {
            const backendUser = await getUserByAuth0Id(auth0Id);
            const userMarketId = backendUser.marketId;
            if (userMarketId) {
                marketId = userMarketId;
            }

            // Buscar pedidos e produtos
            const [ordersData, productsData] = await Promise.all([
                getOrders({ page: 1, size: 1000, marketId: marketId || undefined }),
                marketId
                    ? getProductsByMarket(marketId, { page: 1, size: 1000 })
                    : Promise.resolve({
                        products: [],
                        meta: { page: 1, size: 0, total: 0, totalPages: 0, totalItems: 0 }
                      } as ProductPaginatedResponse),
            ]);
            const orders = ordersData.orders || [];
            const products = productsData?.products || [];
            const productMap = new Map<string, string>();
            for (const p of products) {
                productMap.set(p.id, p.name || p.id);
            }

            // Status
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

            // Faturamento por método de pagamento (entregues)
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

            // Ticket médio semanal (entregues)
            const delivered = orders.filter((o: Order) => o.status === 'DELIVERED');
            const byWeek = new Map<string, { sum: number; count: number }>();
            for (const o of delivered) {
                const d = new Date(o.createdAt);
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
                return `Sem ${String(w).padStart(2, '0')}/${String(y).slice(-2)}`;
            };
            weeklyTicketData = sortedWeeks.map(([key, v]) => ({
                semana: weekLabel(key),
                ticket: v.count > 0 ? v.sum / v.count : 0,
            }));

            // Faturamento diário últimos 30 dias (entregues)
            const now = new Date();
            const last30: Array<{ dateKey: string; label: string }> = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().slice(0, 10);
                const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                last30.push({ dateKey: key, label });
            }
            const revenueMap = new Map(last30.map(({ dateKey }) => [dateKey, 0]));
            for (const o of delivered) {
                const key = new Date(o.createdAt).toISOString().slice(0, 10);
                if (revenueMap.has(key)) {
                    revenueMap.set(key, (revenueMap.get(key) || 0) + (o.total || 0));
                }
            }
            revenueDailyData = last30.map(({ dateKey, label }) => ({
                date: label,
                revenue: revenueMap.get(dateKey) || 0,
            }));

            // Top produtos (quantidade) entre entregues
            const qtyMap = new Map<string, number>();
            for (const o of delivered) {
                for (const it of o.items || []) {
                    qtyMap.set(it.productId, (qtyMap.get(it.productId) || 0) + (it.quantity || 0));
                }
            }
            topProductsData = Array.from(qtyMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([productId, quantity]) => ({
                    name: productMap.get(productId) || productId,
                    quantity,
                }));
        }
    } catch (error) {
        console.error('Erro ao montar dados de relatórios:', error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <HeaderInfo title="Relatórios" description="Visualize relatórios e análises do seu mercado" />
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Relatório
                </Button>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <ChartRevenueDaily data={revenueDailyData} />
                <ChartPaymentMethod data={paymentData} />
                <ChartPieLabel data={statusData} />
                <ChartAreaDefault data={weeklyTicketData} title="Ticket médio semanal" subtitle="Últimas 6 semanas" />
                <ChartTopProducts data={topProductsData} />
            </div>
        </div>
    );
}

