import { getOrdersByMarketId } from "@/actions/order.actions";
import { HeaderInfo } from "@/app/components/HeaderInfo";
import Pagination from "@/app/components/Pagination";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SelectFilter } from "./components/SelectFilter";

interface OrdersSearchParams {
    page?: string;
    size?: string;
    status?: string;
    paymentMethod?: string;
}

export default async function OrdersPage({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams: Promise<OrdersSearchParams> }) {
    const { tenantId } = await params;
    const { page = "1", size = "10", status = "", paymentMethod = "" } = await searchParams;

    const { orders, meta } = await getOrdersByMarketId(tenantId, {
        page: page ? Number(page) : 1,
        size: size ? Number(size) : 10,
        status: status || undefined,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "-";
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    };

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            PENDING: "Pendente",
            CONFIRMED: "Confirmado",
            PREPARING: "Preparando",
            READY_FOR_DELIVERY: "Pronto para Entrega",
            OUT_FOR_DELIVERY: "Saiu para Entrega",
            DELIVERED: "Entregue",
            CANCELLED: "Cancelado",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            PENDING: "text-yellow-600",
            CONFIRMED: "text-blue-600",
            PREPARING: "text-orange-600",
            READY_FOR_DELIVERY: "text-purple-600",
            OUT_FOR_DELIVERY: "text-indigo-600",
            DELIVERED: "text-green-600",
            CANCELLED: "text-red-600",
        };
        return colorMap[status] || "text-muted-foreground";
    };

    return (
        <div className="flex flex-1 flex-col gap-4 pr-4">
            <HeaderInfo title="Pedidos" description="Visualize e gerencie os pedidos do mercado" />

            <Card className="flex flex-col flex-1">
                <CardHeader className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                        <SelectFilter options={[
                            { label: "Pendente", value: "PENDING" },
                            { label: "Confirmado", value: "CONFIRMED" },
                            { label: "Preparando", value: "PREPARING" },
                            { label: "Pronto para Entrega", value: "READY_FOR_DELIVERY" },
                            { label: "Saiu para Entrega", value: "OUT_FOR_DELIVERY" },
                            { label: "Entregue", value: "DELIVERED" },
                            { label: "Cancelado", value: "CANCELLED" }]} value={status ?? ""} label="Status" placeholder="Status" />
                    </div>
                    <div className="col-span-2">
                        <SelectFilter options={[
                            { label: "Todos", value: "ALL" },
                            { label: "Cartão de Crédito", value: "CREDIT_CARD" },
                            { label: "Cartão de Débito", value: "DEBIT_CARD" },
                            { label: "PIX", value: "PIX" },
                            { label: "Dinheiro", value: "CASH" }]} value={paymentMethod ?? ""} label="Método de Pagamento" placeholder="Método de pagamento" />
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col flex-1">
                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="text-left py-2 pr-4">ID</th>
                                            <th className="text-left py-2 pr-4">Status</th>
                                            <th className="text-left py-2 pr-4">Total</th>
                                            <th className="text-left py-2 pr-4">Método de Pagamento</th>
                                            <th className="text-left py-2 pr-4">Endereço de Entrega</th>
                                            <th className="text-left py-2 pr-4">Itens</th>
                                            <th className="text-left py-2 pr-4">Data de Criação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/50">
                                                <td className="py-2 pr-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                                <td className="py-2 pr-4">
                                                    <span className={`font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4 font-medium">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {order.paymentMethod === "CREDIT_CARD" && "Cartão de Crédito"}
                                                    {order.paymentMethod === "DEBIT_CARD" && "Cartão de Débito"}
                                                    {order.paymentMethod === "PIX" && "PIX"}
                                                    {order.paymentMethod === "CASH" && "Dinheiro"}
                                                </td>
                                                <td className="py-2 pr-4 text-muted-foreground max-w-xs truncate">
                                                    {order.deliveryAddress || "-"}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {order.items?.length || 0} item(s)
                                                </td>
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                    )}
                </CardContent>
                <Separator />
                <CardFooter>
                    {meta && <Pagination meta={meta} />}
                </CardFooter>
            </Card>
        </div>
    );
}

