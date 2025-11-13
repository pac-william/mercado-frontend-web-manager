import { getUserByAuth0Id } from "@/actions/user.actions";
import { getReportsSummary } from "@/actions/reports.actions";
import { ChartAreaDefault } from "@/app/components/charts/ChartAreaDefault";
import { ChartPaymentMethod } from "@/app/components/charts/ChartPaymentMethod";
import { ChartPieLabel } from "@/app/components/charts/ChartPieLabel";
import { ChartRevenueDaily } from "@/app/components/charts/ChartRevenueDaily";
import { ChartTopProducts } from "@/app/components/charts/ChartTopProducts";
import { HeaderInfo } from "@/app/components/HeaderInfo";
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

            const summary = await getReportsSummary(marketId, { days: 30, weeks: 6, top: 5 });
            statusData = summary.statusData;
            paymentData = summary.paymentData;
            weeklyTicketData = summary.weeklyTicketData;
            revenueDailyData = summary.revenueDailyData;
            topProductsData = summary.topProductsData;
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

