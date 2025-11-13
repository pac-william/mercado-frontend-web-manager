"use server"

import { baseUrl } from "@/config/server";
import { auth0 } from "@/lib/auth0";

export type ReportsSummaryResponse = {
    statusData: Array<{ status: string; pedidos: number }>;
    paymentData: Array<{ method: string; value: number }>;
    weeklyTicketData: Array<{ semana: string; ticket: number }>;
    revenueDailyData: Array<{ date: string; revenue: number }>;
    topProductsData: Array<{ name: string; quantity: number }>;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalProducts: number;
}

export async function getReportsSummary(marketId: string, opts?: { days?: number; weeks?: number; top?: number }): Promise<ReportsSummaryResponse> {
    const session = await auth0.getSession();
    if (!session) {
        throw new Error("Usuário não autenticado");
    }
    const params = new URLSearchParams();
    if (opts?.days) params.set("days", String(opts.days));
    if (opts?.weeks) params.set("weeks", String(opts.weeks));
    if (opts?.top) params.set("top", String(opts.top));

    const url = `${baseUrl}/api/v1/reports/markets/${encodeURIComponent(marketId)}/summary${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.tokenSet.idToken}`,
        },
        cache: "no-store",
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(msg || "Erro ao buscar relatórios");
    }
    return await res.json() as ReportsSummaryResponse;
}


