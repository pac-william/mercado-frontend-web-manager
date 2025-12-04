import { getOrdersByMarketId } from "@/actions/order.actions";
import { OrdersPageClient } from "./components/OrdersPageClient";

interface OrdersSearchParams {
    page?: string;
    size?: string;
    status?: string;
    paymentMethod?: string;
}

export default async function OrdersPage({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<OrdersSearchParams> }) {
    const { tenantId } = await params;
    const { page = "1", size = "10", status = "", paymentMethod = "" } = await searchParams;

    const ordersData = await getOrdersByMarketId(tenantId, {
        page: page ? Number(page) : 1,
        size: size ? Number(size) : 10,
        status: status || undefined,
    });

    return (
        <OrdersPageClient
            tenantId={tenantId}
            initialOrders={ordersData}
        />
    );
}

